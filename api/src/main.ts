import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // NestFactory: boots (Restart) the Nest app

  app.setGlobalPrefix('api'); // every controller route becomes /api/...

  // CORS: keep localhost for dev, optionally add more via env
  const allowedOrigins = ['http://localhost:4200'];
  
  if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(...process.env.CORS_ORIGIN.split(','));
  }

  // frontend on 4200 can call API on 3000
  app.enableCors({
    origin: ['http://localhost:4200'], // dev
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
