import { Schema } from 'mongoose';
import { BookingStatus } from '../enums/booking.enum';

const BookingSchema = new Schema(
	{
		bookingStatus: {
			type: String,
			enum: BookingStatus,
			default: BookingStatus.REQUESTED,
		},
		bookingPatientId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},
		bookingClinicId: {
			type: Schema.Types.ObjectId,
			ref: 'Clinic',
			required: true,
		},
		bookingProcedureId: {
			type: Schema.Types.ObjectId,
			ref: 'Procedure',
			required: true,
		},
		bookingPreferredDate: {
			type: Date,
			required: true,
		},
		bookingConfirmedDate: {
			type: Date,
			default: null, // filled in once the clinic confirms
		},
		bookingNote: {
			type: String,
			default: '',
		},
		// Cross-service references (filled in later by the Payment service)
		bookingPaymentId: {
			type: Schema.Types.ObjectId,
			default: null,
		},
		bookingContractId: {
			type: Schema.Types.ObjectId,
			default: null,
		},
	},
	{ timestamps: true },
);

// So patients and clinics can quickly look up their own bookings
BookingSchema.index({ bookingPatientId: 1, bookingStatus: 1 });
BookingSchema.index({ bookingClinicId: 1, bookingStatus: 1 });

export default BookingSchema;
