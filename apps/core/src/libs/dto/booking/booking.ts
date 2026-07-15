import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { BookingStatus } from '../../enums/booking.enum';

@ObjectType()
export class Booking {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => BookingStatus)
	bookingStatus: BookingStatus;

	@Field(() => String)
	bookingPatientId: ObjectId;

	@Field(() => String)
	bookingClinicId: ObjectId;

	@Field(() => String)
	bookingProcedureId: ObjectId;

	@Field(() => Date)
	bookingPreferredDate: Date;

	@Field(() => Date, { nullable: true })
	bookingConfirmedDate?: Date;

	@Field(() => String)
	bookingNote: string;

	@Field(() => Float, { nullable: true })
	bookingAmount?: number;

	@Field(() => String, { nullable: true })
	bookingCurrency?: string;

	// Cross-service refs into Postgres (Payment/Contract) — UUID strings,
	// not Mongo ObjectIds
	@Field(() => String, { nullable: true })
	bookingPaymentId?: string;

	@Field(() => String, { nullable: true })
	bookingContractId?: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

// List + total count (pagination)
@ObjectType()
export class Bookings {
	@Field(() => [Booking])
	list: Booking[];

	@Field(() => Int)
	total: number;
}
