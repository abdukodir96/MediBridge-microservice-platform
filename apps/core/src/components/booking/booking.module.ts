import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BookingResolver } from './booking.resolver';
import { BookingService } from './booking.service';
import BookingSchema from '../../libs/schema/booking.model';
import ClinicSchema from '../../libs/schema/clinic.model';
import ProcedureSchema from '../../libs/schema/procedure.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { ClinicModule } from '../clinic/clinic.module';
import { ProcedureModule } from '../procedure/procedure.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Booking', schema: BookingSchema },
			{ name: 'Clinic', schema: ClinicSchema },
			{ name: 'Procedure', schema: ProcedureSchema },
		]),
		AuthModule, // RolesGuard/AuthGuard depend on AuthService
		// For the Booking type's patient/clinic/procedure field resolvers
		MemberModule,
		ClinicModule,
		ProcedureModule,
		ClientsModule.register([
			{
				name: 'PAYMENT_SERVICE',
				transport: Transport.TCP,
				options: {
					host: process.env.PAYMENT_TCP_HOST || 'localhost',
					port: Number(process.env.PAYMENT_TCP_PORT) || 3004,
				},
			},
		]),
	],
	providers: [BookingResolver, BookingService],
	exports: [BookingService],
})
export class BookingModule {}
