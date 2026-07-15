import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, isValidObjectId } from 'mongoose';
import { Review, Reviews } from '../../libs/dto/review/review';
import { ReviewInput, ReviewsInquiry } from '../../libs/dto/review/review.input';
import { Booking } from '../../libs/dto/booking/booking';
import { Clinic } from '../../libs/dto/clinic/clinic';
import { BookingStatus } from '../../libs/enums/booking.enum';
import { ClinicStatus } from '../../libs/enums/clinic.enum';

const DUPLICATE_KEY_ERROR = 11000;

const assertValidObjectId = (id: ObjectId | string, label: string): void => {
	if (!isValidObjectId(id)) {
		throw new BadRequestException(`Invalid ${label} id`);
	}
};

@Injectable()
export class ReviewService {
	constructor(
		@InjectModel('Review') private readonly reviewModel: Model<Review>,
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
		@InjectModel('Clinic') private readonly clinicModel: Model<Clinic>,
	) {}

	// PATIENT — reviews their own COMPLETED booking (one review per booking)
	public async createReview(
		patientId: ObjectId,
		input: ReviewInput,
	): Promise<Review> {
		assertValidObjectId(input.reviewBookingId, 'booking');
		const booking = await this.bookingModel
			.findById(input.reviewBookingId)
			.exec();
		if (!booking) throw new NotFoundException('Booking not found');

		// OWNERSHIP: only the booking's own patient can review it
		if (String(booking.bookingPatientId) !== String(patientId)) {
			throw new ForbiddenException('This is not your booking');
		}

		// STATE: only a completed booking can be reviewed
		if (booking.bookingStatus !== BookingStatus.COMPLETED) {
			throw new BadRequestException(
				`Cannot review a booking with status ${booking.bookingStatus}`,
			);
		}

		let review: Review;
		try {
			review = await this.reviewModel.create({
				reviewBookingId: booking._id,
				reviewPatientId: patientId,
				reviewClinicId: booking.bookingClinicId,
				reviewRating: input.reviewRating,
				reviewText: input.reviewText ?? '',
			});
		} catch (err) {
			const error = err as { code?: number };
			// There's a check-then-create race here in principle, but the
			// @unique index on reviewBookingId is the real guard (same
			// reasoning as Payment's idempotencyKey / P2002 handling) — this
			// just turns the raw duplicate-key crash into a clean 400.
			if (error.code === DUPLICATE_KEY_ERROR) {
				throw new BadRequestException(
					'This booking has already been reviewed',
				);
			}
			throw err;
		}

		// Recompute from the current DB state (never increment) so the
		// aggregate stays correct even if two reviews land back to back.
		await this.recalculateClinicRating(booking.bookingClinicId as ObjectId);

		return review;
	}

	// Anyone — lists a clinic's reviews (VERIFIED clinics only, same
	// visibility rule as getClinic/getClinics/getProceduresByClinic)
	public async getReviewsByClinic(
		clinicId: ObjectId,
		input: ReviewsInquiry,
	): Promise<Reviews> {
		assertValidObjectId(clinicId, 'clinic');
		const clinic = await this.clinicModel
			.findOne({ _id: clinicId, clinicStatus: ClinicStatus.VERIFIED })
			.exec();
		if (!clinic) throw new NotFoundException('Clinic not found');

		const { page = 1, limit = 10 } = input;
		const skip = (page - 1) * limit;

		const [list, total] = await Promise.all([
			this.reviewModel
				.find({ reviewClinicId: clinicId })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.exec(),
			this.reviewModel.countDocuments({ reviewClinicId: clinicId }),
		]);

		return { list, total };
	}

	private async recalculateClinicRating(clinicId: ObjectId): Promise<void> {
		const [agg] = await this.reviewModel.aggregate([
			{ $match: { reviewClinicId: clinicId } },
			{
				$group: {
					_id: null,
					avgRating: { $avg: '$reviewRating' },
					count: { $sum: 1 },
				},
			},
		]);

		await this.clinicModel.findByIdAndUpdate(clinicId, {
			clinicRating: agg?.avgRating ?? 0,
			clinicReviewCount: agg?.count ?? 0,
		});
	}
}
