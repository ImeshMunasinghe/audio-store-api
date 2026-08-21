import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard) // Applies the bouncer to EVERY route in this file
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new order (Checkout)' })
  @ApiResponse({ status: 201, description: 'Order successfully placed and stock deducted.' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid payload.' })
  checkout(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    // req.user is populated automatically by the JwtAuthGuard
    const userId = req.user.userId;
    return this.ordersService.checkout(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get order history for the logged-in user' })
  @ApiResponse({ status: 200, description: 'List of past orders.' })
  getUserOrders(@Req() req: any) {
    const userId = req.user.userId;
    return this.ordersService.getUserOrders(userId);
  }
}