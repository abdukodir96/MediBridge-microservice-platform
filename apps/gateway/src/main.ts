import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validate at the edge (client-facing) rather than only relying on Core's
  // TCP-side validation — fails fast, no wasted round trip to Core.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({
    origin: true, // dev: any origin; lock down to a real domain in production
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
