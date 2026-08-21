import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Soundcore R50i Earbuds' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'High-quality wireless earbuds with deep bass.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'Earbuds' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 30, description: 'Battery life in hours' })
  @IsOptional()
  @IsInt()
  @Min(0)
  batteryLifeHours?: number;

  @ApiProperty({ example: true, description: 'Has Active Noise Cancellation' })
  @IsBoolean()
  hasANC: boolean;
}