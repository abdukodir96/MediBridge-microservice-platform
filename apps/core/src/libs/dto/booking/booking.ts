import { Field, ObjectType, Int } from '@nestjs/graphql';
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

	@Field(() => String, { nullable: true })
	bookingPaymentId?: ObjectId;

	@Field(() => String, { nullable: true })
	bookingContractId?: ObjectId;

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
