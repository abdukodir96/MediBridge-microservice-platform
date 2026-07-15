import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

const CANCELLABLE_STATUSES = [BookingStatus.REQUESTED, BookingStatus.CONFIRMED];

@Injectable()
export class BookingService {
	constructor(
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
		@InjectModel('Clinic') private readonly clinicModel: Model<Clinic>,
		@InjectModel('Procedure') private readonly procedureModel: Model<Procedure>,
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

		// STATE MACHINE: the status check happens in the same atomic update as
		// the write, so two concurrent requests can't both see REQUESTED and
		// both succeed (findById + save would race here).
		const result = await this.bookingModel
			.findOneAndUpdate(
				{ _id: bookingId, bookingStatus: BookingStatus.REQUESTED },
				{ bookingStatus: BookingStatus.CONFIRMED, bookingConfirmedDate: new Date() },
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
