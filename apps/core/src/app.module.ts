import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppResolver } from './app.resolver';
import { MemberModule } from './components/member/member.module';
import { ClinicModule } from './components/clinic/clinic.module';
import { ProcedureModule } from './components/procedure/procedure.module';
import { BookingModule } from './components/booking/booking.module';
import { ReviewModule } from './components/review/review.module';
import { GqlThrottlerGuard } from './libs/auth/guards/gql-throttler.guard';

@Module({
	imports: [
		// Load .env files (available across the whole app)
		ConfigModule.forRoot({ isGlobal: true }),

		// Connect to MongoDB (via MONGO_URI from .env)
		MongooseModule.forRoot(process.env.MONGO_URI as string),

		// Global request rate limit (per-IP); tighter limits are applied to
		// login/signup specifically via @Throttle on those resolvers
		ThrottlerModule.forRoot([
			{
				ttl: 60_000, // 1 minute window
				limit: 60, // 60 requests / minute / IP by default
			},
		]),

		// GraphQL setup
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: process.env.NODE_ENV !== 'production', // enabled only in dev
			introspection: process.env.NODE_ENV !== 'production', // schema is hidden in prod
			autoSchemaFile: true, // schema is generated automatically (code-first)
			context: ({ req }) => ({ req }), // needed for auth guard
		}),
		MemberModule,
		ClinicModule,
		ProcedureModule,
		BookingModule,
		ReviewModule,
	],
	controllers: [],
	providers: [
		AppResolver,
		{ provide: APP_GUARD, useClass: GqlThrottlerGuard },
	],
})
export class AppModule {}