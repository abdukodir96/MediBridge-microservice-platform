import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      // Apollo's GraphQL Playground (dev only) needs inline scripts/styles and
      // cross-origin assets, which the default CSP blocks — disable it outside
      // production instead of hand-tuning a policy just for the dev tool.
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({
    origin: true, // dev: any origin; lock down to a real domain in production
    credentials: true,
  });

  // TCP microservice listener (talks to the Gateway).
  // `inheritAppConfig: true` is required — global pipes/guards/interceptors
  // registered via useGlobalPipes() etc. do NOT apply to hybrid microservice
  // listeners by default, so without this the TCP surface would skip
  // ValidationPipe entirely (class-validator checks silently bypassed).
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.TCP_PORT) || 3002,
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);

  console.log(`Core GraphQL: http://localhost:${process.env.PORT ?? 3000}/graphql`);
  console.log(`Core TCP microservice: port ${process.env.TCP_PORT || 3002}`);
}
bootstrap();
