import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transform: true,            // Auto-transform types
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
