import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import ReviewSchema from '../../libs/schema/review.model';
import BookingSchema from '../../libs/schema/booking.model';
import ClinicSchema from '../../libs/schema/clinic.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Review', schema: ReviewSchema },
			{ name: 'Booking', schema: BookingSchema },
			{ name: 'Clinic', schema: ClinicSchema },
		]),
		AuthModule, // RolesGuard depends on AuthService
	],
	providers: [ReviewResolver, ReviewService],
	exports: [ReviewService],
})
export class ReviewModule {}
