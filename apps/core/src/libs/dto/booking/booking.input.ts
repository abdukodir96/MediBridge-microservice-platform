import { Field, InputType, Int } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	IsEnum,
	Min,
	Max,
	IsDateString,
} from 'class-validator';
import { BookingStatus } from '../../enums/booking.enum';

// Create a booking (PATIENT)
@InputType()
export class BookingInput {
	@IsNotEmpty()
	@Field(() => String)
	bookingClinicId: string;

	@IsNotEmpty()
	@Field(() => String)
	bookingProcedureId: string;

	@IsNotEmpty()
	@IsDateString()
	@Field(() => String)
	bookingPreferredDate: string; // ISO date string ("2026-08-12")

	@IsOptional()
	@Field(() => String, { nullable: true })
	bookingNote?: string;
}

// Search / filter bookings (list)
@InputType()
export class BookingsInquiry {
	@IsOptional()
	@IsEnum(BookingStatus)
	@Field(() => BookingStatus, { nullable: true })
	status?: BookingStatus; // filter by status

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true, defaultValue: 1 })
	page?: number;

	@IsOptional()
	@Min(1)
	@Max(50)
	@Field(() => Int, { nullable: true, defaultValue: 10 })
	limit?: number;
}
