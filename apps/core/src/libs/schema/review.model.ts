import { Schema } from 'mongoose';

const ReviewSchema = new Schema(
	{
		reviewBookingId: {
			type: Schema.Types.ObjectId,
			ref: 'Booking',
			required: true,
			unique: true, // one review per booking, enforced at the DB level
		},
		reviewPatientId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},
		reviewClinicId: {
			type: Schema.Types.ObjectId,
			ref: 'Clinic',
			required: true,
		},
		reviewRating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		reviewText: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true },
);

// So a clinic's reviews (and their rating aggregate) can be looked up fast
ReviewSchema.index({ reviewClinicId: 1, createdAt: -1 });

export default ReviewSchema;
