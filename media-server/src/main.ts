import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    express.raw({
      type: 'image/jpeg',
      limit: '5mb',
    }),
  );

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Media server listening on http://0.0.0.0:${port}`);
}
await bootstrap();
