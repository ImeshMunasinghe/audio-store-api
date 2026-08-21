import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Injects Prisma so the AI Service can query the database
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}