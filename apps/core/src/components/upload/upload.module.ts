import { Module } from '@nestjs/common';
import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [AuthModule], // AuthGuard depends on AuthService
	providers: [UploadResolver, UploadService],
})
export class UploadModule {}
