import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicResolver } from './clinic.resolver';
import { ClinicService } from './clinic.service';
import ClinicSchema from '../../libs/schema/clinic.model';
import ProcedureSchema from '../../libs/schema/procedure.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Clinic', schema: ClinicSchema },
			// Needed so getClinics can $lookup procedures for price filter/sort
			{ name: 'Procedure', schema: ProcedureSchema },
		]),
		AuthModule, // RolesGuard depends on AuthService
		MemberModule, // for the Clinic type's owner field resolver
		TranslationModule, // for locale-aware getClinic/getClinics
	],
	providers: [ClinicResolver, ClinicService],
	exports: [ClinicService],
})
export class ClinicModule {}
