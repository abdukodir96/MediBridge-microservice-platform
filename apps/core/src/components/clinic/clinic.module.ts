import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicResolver } from './clinic.resolver';
import { ClinicService } from './clinic.service';
import ClinicSchema from '../../libs/schema/clinic.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Clinic', schema: ClinicSchema }]),
		AuthModule, // RolesGuard depends on AuthService
	],
	providers: [ClinicResolver, ClinicService],
	exports: [ClinicService],
})
export class ClinicModule {}
