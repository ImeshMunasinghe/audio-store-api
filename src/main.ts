import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Apply our custom global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 2. Enforce strict DTO validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3. Configure Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Audio & Tech Gadget API')
    .setDescription('Headless backend for e-commerce store')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 4. Secure CORS configurations
  app.enableCors({
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();