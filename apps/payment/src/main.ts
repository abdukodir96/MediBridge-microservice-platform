import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	app.connectMicroservice<MicroserviceOptions>(
		{
			transport: Transport.TCP,
			options: {
				host: '0.0.0.0',
				port: Number(process.env.TCP_PORT) || 3004,
			},
		},
		{ inheritAppConfig: true },
	);

	await app.startAllMicroservices();
	await app.listen(process.env.PORT ?? 3003);

	console.log(`Payment HTTP: http://localhost:${process.env.PORT ?? 3003}`);
	console.log(`Payment TCP microservice: port ${process.env.TCP_PORT || 3004}`);
}
bootstrap();
