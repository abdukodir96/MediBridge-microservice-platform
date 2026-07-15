import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ReviewService } from './review.service';
import { Review, Reviews } from '../../libs/dto/review/review';
import { ReviewInput, ReviewsInquiry } from '../../libs/dto/review/review.input';
import { RolesGuard } from '../../libs/auth/guards/roles.guard';
import { Roles } from '../../libs/auth/decorators/roles.decorator';
import { AuthMember } from '../../libs/auth/decorators/auth-member.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class ReviewResolver {
	constructor(private readonly reviewService: ReviewService) {}

	// PATIENT — reviews their own completed booking
	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Review)
	public async createReview(
		@Args('input') input: ReviewInput,
		@AuthMember('_id') patientId: ObjectId,
	): Promise<Review> {
		console.log('Mutation: createReview');
		return await this.reviewService.createReview(patientId, input);
	}

	// Anyone — lists a clinic's reviews
	@Query(() => Reviews)
	public async getReviewsByClinic(
		@Args('clinicId') clinicId: string,
		@Args('input') input: ReviewsInquiry,
	): Promise<Reviews> {
		console.log('Query: getReviewsByClinic');
		return await this.reviewService.getReviewsByClinic(
			clinicId as unknown as ObjectId,
			input,
		);
	}
}
