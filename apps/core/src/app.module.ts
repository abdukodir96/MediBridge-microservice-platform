import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { MemberModule } from './components/member/member.module';

@Module({
	imports: [
		// Load .env files (available across the whole app)
		ConfigModule.forRoot({ isGlobal: true }),

		// Connect to MongoDB (via MONGO_URI from .env)
		MongooseModule.forRoot(process.env.MONGO_URI as string),

		// GraphQL setup
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: process.env.NODE_ENV !== 'production', // enabled only in dev
			autoSchemaFile: true, // schema is generated automatically (code-first)
			context: ({ req }) => ({ req }), // needed for auth guard
		}),
		MemberModule,
	],
	controllers: [],
	providers: [AppResolver],
})
export class AppModule {}