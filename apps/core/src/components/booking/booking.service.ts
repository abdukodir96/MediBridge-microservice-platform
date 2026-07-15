import {
	Injectable,
	Inject,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { Model, ObjectId, isValidObjectId } from 'mongoose';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import {
	BookingInput,
	BookingsInquiry,
} from '../../libs/dto/booking/booking.input';
import { Clinic } from '../../libs/dto/clinic/clinic';
import { Procedure } from '../../libs/dto/procedure/procedure';
import { BookingStatus } from '../../libs/enums/booking.enum';
import { ClinicStatus } from '../../libs/enums/clinic.enum';
import { MemberType } from '../../libs/enums/member.enum';

const assertValidObjectId = (id: ObjectId | string, label: string): void => {
	if (!isValidObjectId(id)) {
		throw new BadRequestException(`Invalid ${label} id`);
	}
};

const CANCELLABLE_STATUSES = [
	BookingStatus.REQUESTED,
	BookingStatus.CONFIRMED,
	BookingStatus.PAID,
];

@Injectable()
export class BookingService {
	constructor(
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
		@InjectModel('Clinic') private readonly clinicModel: Model<Clinic>,
		@InjectModel('Procedure') private readonly procedureModel: Model<Procedure>,
		@Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
	) {}

	// PATIENT — creates a new booking (REQUESTED)
	public async createBooking(
		patientId: ObjectId,
		input: BookingInput,
	): Promise<Booking> {
		assertValidObjectId(input.bookingClinicId, 'clinic');
		assertValidObjectId(input.bookingProcedureId, 'procedure');
		const clinicId = input.bookingClinicId as unknown as ObjectId;
		const procedureId = input.bookingProcedureId as unknown as ObjectId;

		// 1. Does the clinic exist and is it VERIFIED?
		const clinic = await this.clinicModel
			.findOne({
				_id: clinicId,
				clinicStatus: ClinicStatus.VERIFIED,
			})
			.exec();
		if (!clinic) {
			throw new NotFoundException('Clinic not found or not verified');
		}

		// 2. Does the procedure exist and belong to this clinic?
		const procedure = await this.procedureModel
			.findOne({
				_id: procedureId,
				procedureClinicId: clinicId,
			})
			.exec();
		if (!procedure) {
			throw new BadRequestException(
				'Procedure not found or does not belong to this clinic',
			);
		}

		// 3. Preferred date must be in the future
		const preferredDate = new Date(input.bookingPreferredDate);
		if (preferredDate < new Date()) {
			throw new BadRequestException('Preferred date must be in the future');
		}

		try {
			const result = await this.bookingModel.create({
				bookingPatientId: patientId,
				bookingClinicId: clinic._id,
				bookingProcedureId: procedure._id,
				bookingPreferredDate: preferredDate,
				bookingNote: input.bookingNote ?? '',
			});
			return result;
		} catch (err) {
			const error = err as { message?: string };
			console.log('Error, createBooking:', error.message);
			throw new BadRequestException('Failed to create booking');
		}
	}

	// CLINIC — confirms a booking made to its own clinic (REQUESTED → CONFIRMED)
	public async confirmBooking(
		ownerId: ObjectId,
		bookingId: ObjectId,
	): Promise<Booking> {
		assertValidObjectId(bookingId, 'booking');
		const booking = await this.bookingModel.findById(bookingId).exec();
		if (!booking) throw new NotFoundException('Booking not found');

		// OWNERSHIP: does this booking's clinic belong to the caller?
		const clinic = await this.clinicModel
			.findOne({ _id: booking.bookingClinicId, clinicOwnerId: ownerId })
			.exec();
		if (!clinic) {
			throw new ForbiddenException('This booking does not belong to your clinic');
		}

		// Snapshot the price now, at confirmation time — if the clinic edits
		// the procedure's price later, it must not change what was agreed.
		const procedure = await this.procedureModel
			.findById(booking.bookingProcedureId)
			.exec();
		if (!procedure) throw new NotFoundException('Procedure not found');

		// STATE MACHINE: the status check happens in the same atomic update as
		// the write, so two concurrent requests can't both see REQUESTED and
		// both succeed (findById + save would race here).
		const result = await this.bookingModel
			.findOneAndUpdate(
				{ _id: bookingId, bookingStatus: BookingStatus.REQUESTED },
				{
					bookingStatus: BookingStatus.CONFIRMED,
					bookingConfirmedDate: new Date(),
					bookingAmount: procedure.procedurePriceMin,
					bookingCurrency: procedure.procedureCurrency,
				},
				{ new: true },
			)
			.exec();
		if (!result) {
			throw new BadRequestException(
				`Cannot confirm a booking with status ${booking.bookingStatus}`,
			);
		}
		return result;
	}

	// PATIENT or CLINIC — cancels a booking
	public async cancelBooking(
		authMemberId: ObjectId,
		memberType: MemberType,
		bookingId: ObjectId,
	): Promise<Booking> {
		assertValidObjectId(bookingId, 'booking');
		const booking = await this.bookingModel.findById(bookingId).exec();
		if (!booking) throw new NotFoundException('Booking not found');

		// OWNERSHIP — a different check per role
		if (memberType === MemberType.PATIENT) {
			// A patient may only cancel their OWN booking
			if (String(booking.bookingPatientId) !== String(authMemberId)) {
				throw new ForbiddenException('This is not your booking');
			}
		} else if (memberType === MemberType.CLINIC) {
			// A clinic may only cancel bookings made to ITSELF
			const clinic = await this.clinicModel
				.findOne({ _id: booking.bookingClinicId, clinicOwnerId: authMemberId })
				.exec();
			if (!clinic) {
				throw new ForbiddenException(
					'This booking does not belong to your clinic',
				);
			}
		} else {
			throw new ForbiddenException('Not allowed to cancel bookings');
		}

		// A PAID booking has money in escrow — refund it BEFORE flipping the
		// booking to CANCELLED. If the refund succeeds but the update below
		// fails, a retry re-cancels the same booking: refund is idempotent
		// (already-REFUNDED replays as success), so the retry just needs to
		// land the CANCELLED write. Doing it in the other order — CANCELLED
		// first — would risk a cancelled booking whose money is stuck HELD,
		// which leaves the patient out of pocket. We accept the failure mode
		// that favors the patient.
		if (
			booking.bookingStatus === BookingStatus.PAID &&
			booking.bookingPaymentId
		) {
			try {
				await firstValueFrom(
					this.paymentClient
						.send(
							{ cmd: 'payment.refund' },
							{ paymentId: booking.bookingPaymentId },
						)
						.pipe(timeout(5000)),
				);
			} catch (err) {
				const error = err as { message?: string };
				console.log('Error, cancelBooking → payment.refund:', error.message);
				throw new BadRequestException(
					'Payment service unavailable, cancellation aborted — please try again',
				);
			}
		}

		// STATE MACHINE: atomic conditional update — same race-safety reasoning
		// as confirmBooking. Final states (CANCELLED, COMPLETED) can't be cancelled.
		const result = await this.bookingModel
			.findOneAndUpdate(
				{ _id: bookingId, bookingStatus: { $in: CANCELLABLE_STATUSES } },
				{ bookingStatus: BookingStatus.CANCELLED },
				{ new: true },
			)
			.exec();
		if (!result) {
			throw new BadRequestException(
				`Cannot cancel a booking with status ${booking.bookingStatus}`,
			);
		}
		return result;
	}

	// PATIENT — pays a confirmed booking (CONFIRMED → PAID)
	public async payBooking(
		patientId: ObjectId,
		bookingId: ObjectId,
	): Promise<Booking> {
		assertValidObjectId(bookingId, 'booking');
		const booking = await this.bookingModel.findById(bookingId).exec();
		if (!booking) throw new NotFoundException('Booking not found');

		// OWNERSHIP: only the booking's own patient can pay it
		if (String(booking.bookingPatientId) !== String(patientId)) {
			throw new ForbiddenException('This is not your booking');
		}

		// IDEMPOTENT REPLAY: already paid — treat as success, not an error
		if (
			booking.bookingStatus === BookingStatus.PAID &&
			booking.bookingPaymentId
		) {
			return booking;
		}

		// STATE MACHINE: only a CONFIRMED booking can be paid
		if (booking.bookingStatus !== BookingStatus.CONFIRMED) {
			throw new BadRequestException(
				`Cannot pay a booking with status ${booking.bookingStatus}`,
			);
		}

		// The price is only ever set by confirmBooking's snapshot
		if (booking.bookingAmount == null) {
			throw new BadRequestException('Booking has no confirmed amount');
		}

		// TCP → Payment service (bounded wait so an unreachable service fails
		// fast and clearly, instead of hanging the mutation indefinitely)
		let payment: { id: string };
		try {
			payment = await firstValueFrom(
				this.paymentClient
					.send<{ id: string }>(
						{ cmd: 'payment.create' },
						{
							bookingId: String(booking._id),
							patientId: String(booking.bookingPatientId),
							clinicId: String(booking.bookingClinicId),
							amount: booking.bookingAmount,
							currency: booking.bookingCurrency ?? 'USD',
							// Deterministic, booking-scoped key — a retry of this
							// same booking always reuses the same key, so the
							// Payment service's idempotency check actually protects
							// against double-charging on retry.
							idempotencyKey: `booking-${String(booking._id)}`,
						},
					)
					.pipe(timeout(5000)),
			);
		} catch (err) {
			const error = err as { message?: string };
			console.log('Error, payBooking → payment.create:', error.message);
			throw new BadRequestException(
				'Payment service unavailable, please try again',
			);
		}

		// ATOMIC + IDEMPOTENT: CONFIRMED → PAID, same race-safety pattern as
		// confirmBooking/cancelBooking.
		const updated = await this.bookingModel
			.findOneAndUpdate(
				{ _id: bookingId, bookingStatus: BookingStatus.CONFIRMED },
				{
					bookingStatus: BookingStatus.PAID,
					bookingPaymentId: payment.id,
				},
				{ new: true },
			)
			.exec();

		if (!updated) {
			// Lost the race — a concurrent/retried call may have already paid
			// this exact booking with this exact payment. If so, that's a
			// successful idempotent replay, not a failure.
			const current = await this.bookingModel.findById(bookingId).exec();
			if (
				current &&
				current.bookingStatus === BookingStatus.PAID &&
				String(current.bookingPaymentId) === String(payment.id)
			) {
				return current;
			}
			throw new BadRequestException('Booking is no longer payable');
		}

		return updated;
	}

	// CLINIC — marks a paid booking as done (PAID → COMPLETED)
	public async completeBooking(
		ownerId: ObjectId,
		bookingId: ObjectId,
	): Promise<Booking> {
		assertValidObjectId(bookingId, 'booking');
		const booking = await this.bookingModel.findById(bookingId).exec();
		if (!booking) throw new NotFoundException('Booking not found');

		// OWNERSHIP: does this booking's clinic belong to the caller?
		const clinic = await this.clinicModel
			.findOne({ _id: booking.bookingClinicId, clinicOwnerId: ownerId })
			.exec();
		if (!clinic) {
			throw new ForbiddenException('This booking does not belong to your clinic');
		}

		const updated = await this.bookingModel
			.findOneAndUpdate(
				{ _id: bookingId, bookingStatus: BookingStatus.PAID },
				{ bookingStatus: BookingStatus.COMPLETED },
				{ new: true },
			)
			.exec();
		if (!updated) {
			throw new BadRequestException('Booking is not in a completable state');
		}

		return updated;
	}

	// PATIENT — confirms satisfaction with a completed procedure, releasing
	// escrow to the clinic. Booking status stays COMPLETED — payment state
	// belongs to the Payment service, not Core.
	public async confirmCompletion(
		patientId: ObjectId,
		bookingId: ObjectId,
	): Promise<Booking> {
		assertValidObjectId(bookingId, 'booking');
		const booking = await this.bookingModel.findById(bookingId).exec();
		if (!booking) throw new NotFoundException('Booking not found');

		// OWNERSHIP: only the booking's own patient can release the funds
		if (String(booking.bookingPatientId) !== String(patientId)) {
			throw new ForbiddenException('This is not your booking');
		}

		// STATE: only completed bookings can be confirmed
		if (booking.bookingStatus !== BookingStatus.COMPLETED) {
			throw new BadRequestException(
				`Cannot confirm completion for a booking with status ${booking.bookingStatus}`,
			);
		}
		if (!booking.bookingPaymentId) {
			throw new BadRequestException('Booking has no payment to release');
		}

		// TCP → Payment: release (idempotent — a retry is safe)
		try {
			await firstValueFrom(
				this.paymentClient
					.send(
						{ cmd: 'payment.release' },
						{ paymentId: booking.bookingPaymentId },
					)
					.pipe(timeout(5000)),
			);
		} catch (err) {
			const error = err as { message?: string };
			console.log('Error, confirmCompletion → payment.release:', error.message);
			throw new BadRequestException(
				'Payment service unavailable, please try again',
			);
		}

		return booking;
	}

	// PATIENT — views their own bookings
	public async getMyBookings(
		patientId: ObjectId,
		input: BookingsInquiry,
	): Promise<Bookings> {
		const { status, page = 1, limit = 10 } = input;

		const match: any = { bookingPatientId: patientId };
		if (status) match.bookingStatus = status;

		const skip = (page - 1) * limit;
		const [list, total] = await Promise.all([
			this.bookingModel
				.find(match)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.exec(),
			this.bookingModel.countDocuments(match),
		]);

		return { list, total };
	}

	// CLINIC — views the bookings made to its own clinic(s)
	public async getClinicBookings(
		ownerId: ObjectId,
		input: BookingsInquiry,
	): Promise<Bookings> {
		const { status, page = 1, limit = 10 } = input;

		const clinics = await this.clinicModel
			.find({ clinicOwnerId: ownerId })
			.select('_id')
			.exec();
		const clinicIds = clinics.map((c) => c._id);

		const match: any = { bookingClinicId: { $in: clinicIds } };
		if (status) match.bookingStatus = status;

		const skip = (page - 1) * limit;
		const [list, total] = await Promise.all([
			this.bookingModel
				.find(match)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.exec(),
			this.bookingModel.countDocuments(match),
		]);

		return { list, total };
	}
}
