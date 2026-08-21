import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: string, createOrderDto: CreateOrderDto) {
    // 1. Open the ACID Transaction wrapper
    return this.prisma.$transaction(async (tx) => {
      const orderItemsData = [];

      // 2. Loop through every item the customer wants to buy
      for (const item of createOrderDto.items) {
        
        // Fetch the product to get its current price
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ID ${item.productId} not found`);
        }

        // 3. The Race-Condition Fix: Conditional Update
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }, // "Greater Than or Equal to" the requested amount
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // 4. Triggering a Rollback
        if (stockUpdate.count === 0) {
          // If count is 0, someone else bought it a millisecond ago, or stock is too low.
          // Throwing this error instantly aborts the transaction and rolls back any prior updates!
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }

        // Prepare the snapshot data for the OrderItem table
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });
      }

      // 5. If we survive the loop without errors, create the final Order record
      const order = await tx.order.create({
        data: {
          userId,
          status: 'COMPLETED',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true, // Return the items array in the final JSON response
        },
      });

      return order;
    });
  }

  // --- Read-Only Method for Order History ---
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}