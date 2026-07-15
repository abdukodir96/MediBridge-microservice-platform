import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7's prisma-client-js runtime no longer reads DATABASE_URL on its
// own (that env var is only used by the CLI, via prisma.config.ts, for
// migrations) — the client now requires an explicit driver adapter.
@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
