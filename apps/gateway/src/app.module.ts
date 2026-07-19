import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MemberResolver } from './member/member.resolver';
import { GatewayAuthGuard } from './auth/gateway-auth.guard';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),

		// GraphQL — talks to the client
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: process.env.NODE_ENV !== 'production',
			introspection: process.env.NODE_ENV !== 'production',
			autoSchemaFile: true,
			context: ({ req }) => ({ req }),
		}),

		// TCP client — talks to Core
		ClientsModule.register([
			{
				name: 'CORE_SERVICE',
				transport: Transport.TCP,
				options: {
					host: process.env.CORE_TCP_HOST || 'localhost',
					port: Number(process.env.CORE_TCP_PORT) || 3002,
				},
			},
		]),
	],
	providers: [MemberResolver, GatewayAuthGuard],
})
export class AppModule {}
