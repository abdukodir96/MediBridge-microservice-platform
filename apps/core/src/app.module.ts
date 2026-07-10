import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';

@Module({
	imports: [
		// .env fayllarni o'qish (butun app bo'ylab)
		ConfigModule.forRoot({ isGlobal: true }),

		// MongoDB ulash (.env dagi MONGO_URI orqali)
		MongooseModule.forRoot(process.env.MONGO_URI as string),

		// GraphQL sozlash
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: true, // brauzerda test qilish uchun
			autoSchemaFile: true, // schema avtomatik yaratiladi (code-first)
			context: ({ req }) => ({ req }), // auth guard uchun kerak
		}),
	],
	controllers: [],
	providers: [AppResolver],
})
export class AppModule {}