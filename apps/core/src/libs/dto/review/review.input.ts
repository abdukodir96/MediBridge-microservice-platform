import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min, Max, Length } from 'class-validator';

// Create a review (PATIENT, on their own COMPLETED booking)
@InputType()
export class ReviewInput {
	@IsNotEmpty()
	@Field(() => String)
	reviewBookingId: string;

	@IsNotEmpty()
	@Min(1)
	@Max(5)
	@Field(() => Int)
	reviewRating: number;

	@IsOptional()
	@Length(0, 1000)
	@Field(() => String, { nullable: true })
	reviewText?: string;
}

// List a clinic's reviews (pagination)
@InputType()
export class ReviewsInquiry {
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
