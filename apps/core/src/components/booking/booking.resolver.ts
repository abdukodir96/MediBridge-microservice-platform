import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, ResolveField, Parent, Resolver } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { BookingService } from './booking.service';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import {
	BookingInput,
	BookingsInquiry,
} from '../../libs/dto/booking/booking.input';
import { RolesGuard } from '../../libs/auth/guards/roles.guard';
import { AuthGuard } from '../../libs/auth/guards/auth.guard';
import { Roles } from '../../libs/auth/decorators/roles.decorator';
import { AuthMember } from '../../libs/auth/decorators/auth-member.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { MemberService } from '../member/member.service';
import { ClinicService } from '../clinic/clinic.service';
import { ProcedureService } from '../procedure/procedure.service';
import { Member } from '../../libs/dto/member/member';
import { Clinic } from '../../libs/dto/clinic/clinic';
import { Procedure } from '../../libs/dto/procedure/procedure';

@Resolver(() => Booking)
export class BookingResolver {
	constructor(
		private readonly bookingService: BookingService,
		private readonly memberService: MemberService,
		private readonly clinicService: ClinicService,
		private readonly procedureService: ProcedureService,
	) {}

	// PATIENT — creates a booking
	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async createBooking(
		@Args('input') input: BookingInput,
		@AuthMember('_id') patientId: ObjectId,
	): Promise<Booking> {
		console.log('Mutation: createBooking');
		return await this.bookingService.createBooking(patientId, input);
	}

	// CLINIC — confirms a booking made to its own clinic
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async confirmBooking(
		@Args('bookingId') bookingId: string,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Booking> {
		console.log('Mutation: confirmBooking');
		return await this.bookingService.confirmBooking(
			ownerId,
			bookingId as unknown as ObjectId,
		);
	}

	// PATIENT or CLINIC — cancels a booking
	@UseGuards(AuthGuard)
	@Mutation(() => Booking)
	public async cancelBooking(
		@Args('bookingId') bookingId: string,
		@AuthMember('_id') authMemberId: ObjectId,
		@AuthMember('memberType') memberType: MemberType,
	): Promise<Booking> {
		console.log('Mutation: cancelBooking');
		return await this.bookingService.cancelBooking(
			authMemberId,
			memberType,
			bookingId as unknown as ObjectId,
		);
	}

	// PATIENT — pays a confirmed booking
	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async payBooking(
		@Args('bookingId') bookingId: string,
		@AuthMember('_id') patientId: ObjectId,
	): Promise<Booking> {
		console.log('Mutation: payBooking');
		return await this.bookingService.payBooking(
			patientId,
			bookingId as unknown as ObjectId,
		);
	}

	// CLINIC — marks a paid booking as done
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async completeBooking(
		@Args('bookingId') bookingId: string,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Booking> {
		console.log('Mutation: completeBooking');
		return await this.bookingService.completeBooking(
			ownerId,
			bookingId as unknown as ObjectId,
		);
	}

	// PATIENT — confirms satisfaction, releasing escrow to the clinic
	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async confirmCompletion(
		@Args('bookingId') bookingId: string,
		@AuthMember('_id') patientId: ObjectId,
	): Promise<Booking> {
		console.log('Mutation: confirmCompletion');
		return await this.bookingService.confirmCompletion(
			patientId,
			bookingId as unknown as ObjectId,
		);
	}

	// PATIENT — views their own bookings
	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Query(() => Bookings)
	public async getMyBookings(
		@Args('input') input: BookingsInquiry,
		@AuthMember('_id') patientId: ObjectId,
	): Promise<Bookings> {
		console.log('Query: getMyBookings');
		return await this.bookingService.getMyBookings(patientId, input);
	}

	// CLINIC — views the bookings made to its own clinic
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Query(() => Bookings)
	public async getClinicBookings(
		@Args('input') input: BookingsInquiry,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Bookings> {
		console.log('Query: getClinicBookings');
		return await this.bookingService.getClinicBookings(ownerId, input);
	}

	@ResolveField('patient', () => Member)
	async resolvePatient(@Parent() booking: Booking): Promise<Member> {
		return this.memberService.getMember(booking.bookingPatientId);
	}

	@ResolveField('clinic', () => Clinic)
	async resolveClinic(@Parent() booking: Booking): Promise<Clinic> {
		return this.clinicService.getClinic(booking.bookingClinicId);
	}

	@ResolveField('procedure', () => Procedure)
	async resolveProcedure(@Parent() booking: Booking): Promise<Procedure> {
		return this.procedureService.getProcedure(booking.bookingProcedureId);
	}
}
