import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskAiDto {
  @ApiProperty({ example: 'Do you have any earbuds with battery life over 24 hours?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Prompt is too long.' })
  message: string;
}