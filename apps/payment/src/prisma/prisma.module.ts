import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // so other modules don't need to import it individually
@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
