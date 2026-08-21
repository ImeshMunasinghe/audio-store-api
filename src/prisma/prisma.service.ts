import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Initialize the standard pg connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Wrap it in the Prisma adapter
    const adapter = new PrismaPg(pool);
    
    // Pass the adapter into the PrismaClient constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}