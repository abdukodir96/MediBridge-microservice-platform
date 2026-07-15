import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingResolver } from './booking.resolver';
import { BookingService } from './booking.service';
import BookingSchema from '../../libs/schema/booking.model';
import ClinicSchema from '../../libs/schema/clinic.model';
import ProcedureSchema from '../../libs/schema/procedure.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Booking', schema: BookingSchema },
			{ name: 'Clinic', schema: ClinicSchema },
			{ name: 'Procedure', schema: ProcedureSchema },
		]),
		AuthModule, // RolesGuard/AuthGuard depend on AuthService
	],
	providers: [BookingResolver, BookingService],
	exports: [BookingService],
})
export class BookingModule {}
