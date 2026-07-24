import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { BookingStatus } from '../../enums/booking.enum';
import { Member } from '../member/member';
import { Clinic } from '../clinic/clinic';
import { Procedure } from '../procedure/procedure';

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

	// Resolved by BookingResolver's field resolvers, not stored on the
	// document — schema-level declaration only, no initializer needed
	@Field(() => Member)
	patient: Member;

	@Field(() => Clinic)
	clinic: Clinic;

	@Field(() => Procedure)
	procedure: Procedure;
}

// List + total count (pagination)
@ObjectType()
export class Bookings {
	@Field(() => [Booking])
	list: Booking[];

	@Field(() => Int)
	total: number;
}
