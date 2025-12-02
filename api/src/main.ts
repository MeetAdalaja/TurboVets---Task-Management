// // apps/api/src/main.ts
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app/app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.setGlobalPrefix('api'); // so routes are /api/...
//   await app.listen(3000);
// }
// bootstrap();


// when frontend started
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // IMPORTANT: allow Angular dev server
  app.enableCors({
    origin: 'http://localhost:4200',
  });

  await app.listen(3000);
}
bootstrap();
