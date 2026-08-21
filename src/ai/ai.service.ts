import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AskAiDto } from './dto/ask-ai.dto';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(private readonly prisma: PrismaService) {
    // Initialize the Groq client with the API key from our .env file
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async chat(askAiDto: AskAiDto) {
    const userMessage = askAiDto.message;

    // 1. Define the Tool (The Rulebook for the AI)
    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_catalog',
          description: 'Search the e-commerce product catalog by category or maximum price.',
          parameters: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'Product category (e.g., Earbuds, Headphones)' },
              maxPrice: { type: 'number', description: 'Maximum price in dollars' },
            },
          },
        },
      },
    ] as any; // Type assertion required for strict TypeScript compilation with Groq SDK

    try {
      // 2. The initial request to Groq
      const messages: any[] = [
        { role: 'system', content: 'You are a helpful e-commerce assistant. Use tools to look up product inventory.' },
        { role: 'user', content: userMessage }
      ];
      
      const response = await this.groq.chat.completions.create({
        model: 'openai/gpt-oss-20b', // Fast, highly capable open-source model
        messages: messages,
        tools: tools,
        tool_choice: 'auto',
      });

      const responseMessage = response.choices[0].message;

      // 3. The Pause: Did Groq ask us to use a tool?
      if (responseMessage.tool_calls) {
        const toolCall = responseMessage.tool_calls[0];
        
        if (toolCall.function.name === 'search_catalog') {
          // Parse the arguments Groq wants us to use
          const args = JSON.parse(toolCall.function.arguments);
          
          // 4. The Execution: OUR backend runs the secure database query
          const products = await this.prisma.product.findMany({
            where: {
              ...(args.category && { category: { contains: args.category, mode: 'insensitive' } }),
              ...(args.maxPrice && { price: { lte: args.maxPrice } }),
            },
            select: { name: true, price: true, stock: true, hasANC: true }, // Token optimization
          });

          // 5. The Handoff Back: Send the Prisma results back to Groq
          messages.push(responseMessage); // Add the AI's tool request to history
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(products),
          });

          // 6. The Final Answer: Get Groq to format the JSON into English
          const finalResponse = await this.groq.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: messages,
          });

          return { answer: finalResponse.choices[0].message.content };
        }
      }

      // If the user just said "Hello" and no tool was needed, return the text
      return { answer: responseMessage.content };
      
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('AI failed to process the request');
    }
  }
}