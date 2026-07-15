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
		// Snapshotted at CONFIRM time from the procedure's price, so a later
		// price change at the clinic can't change what the patient owes
		bookingAmount: {
			type: Number,
			default: null,
		},
		bookingCurrency: {
			type: String,
			default: null,
		},
		// Cross-service references, filled in later by the Payment service.
		// Payment/Contract live in Postgres and use UUID primary keys, not
		// Mongo ObjectIds — String, not Schema.Types.ObjectId.
		bookingPaymentId: {
			type: String,
			default: null,
		},
		bookingContractId: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true },
);

// So patients and clinics can quickly look up their own bookings
BookingSchema.index({ bookingPatientId: 1, bookingStatus: 1 });
BookingSchema.index({ bookingClinicId: 1, bookingStatus: 1 });

export default BookingSchema;
