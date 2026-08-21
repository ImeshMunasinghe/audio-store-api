import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('AI Assistant')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ask the AI assistant about the product catalog' })
  @ApiResponse({ status: 200, description: 'AI successfully responded with an answer.' })
  @ApiResponse({ status: 400, description: 'Message is empty or too long.' })
  @ApiResponse({ status: 500, description: 'Internal server error from AI provider.' })
  chat(@Body() askAiDto: AskAiDto) {
    return this.aiService.chat(askAiDto);
  }
}