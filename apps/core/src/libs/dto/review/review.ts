import { Field, ObjectType, Int } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';

@ObjectType()
export class Review {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	reviewBookingId: ObjectId;

	@Field(() => String)
	reviewPatientId: ObjectId;

	@Field(() => String)
	reviewClinicId: ObjectId;

	@Field(() => Int)
	reviewRating: number;

	@Field(() => String)
	reviewText: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

// List + total count (pagination)
@ObjectType()
export class Reviews {
	@Field(() => [Review])
	list: Review[];

	@Field(() => Int)
	total: number;
}
