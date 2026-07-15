import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcedureResolver } from './procedure.resolver';
import { ProcedureService } from './procedure.service';
import ProcedureSchema from '../../libs/schema/procedure.model';
import ClinicSchema from '../../libs/schema/clinic.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Procedure', schema: ProcedureSchema },
			{ name: 'Clinic', schema: ClinicSchema }, // needed for ownership checks
		]),
		AuthModule, // RolesGuard depends on AuthService
	],
	providers: [ProcedureResolver, ProcedureService],
	exports: [ProcedureService],
})
export class ProcedureModule {}
