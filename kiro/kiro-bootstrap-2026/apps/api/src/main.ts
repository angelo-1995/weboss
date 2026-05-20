import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  // Multipart file upload support (20 MB max)
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env['APP_URL'] ?? 'http://localhost:3000',
    credentials: true,
  });

  // Swagger (dev only)
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Community OS API')
      .setDescription('Enterprise Community Operating System API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger docs available at /api/docs');
  }

  const port = process.env['APP_PORT'] ?? 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`API running on port ${port}`);

  // Ensure uploads directory exists
  await mkdir(join(process.cwd(), 'uploads', 'sermons'), { recursive: true });
}

bootstrap();
