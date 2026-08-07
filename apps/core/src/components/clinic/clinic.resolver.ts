import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, ResolveField, Parent, Resolver } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ClinicService } from './clinic.service';
import { Clinic, Clinics, ClinicStatusCounts } from '../../libs/dto/clinic/clinic';
import {
	ClinicInput,
	ClinicsInquiry,
	ClinicsAdminInquiry,
} from '../../libs/dto/clinic/clinic.input';
import { ClinicStatus } from '../../libs/enums/clinic.enum';
import { RolesGuard } from '../../libs/auth/guards/roles.guard';
import { Roles } from '../../libs/auth/decorators/roles.decorator';
import { AuthMember } from '../../libs/auth/decorators/auth-member.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { MemberService } from '../member/member.service';
import { Member } from '../../libs/dto/member/member';

@Resolver(() => Clinic)
export class ClinicResolver {
	constructor(
		private readonly clinicService: ClinicService,
		private readonly memberService: MemberService,
	) {}

	// CLINIC role — creates a clinic
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Mutation(() => Clinic)
	public async createClinic(
		@Args('input') input: ClinicInput,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Clinic> {
		console.log('Mutation: createClinic');
		return await this.clinicService.createClinic(ownerId, input);
	}

	// Anyone — searches clinics (public)
	@Query(() => Clinics)
	public async getClinics(
		@Args('input') input: ClinicsInquiry,
	): Promise<Clinics> {
		console.log('Query: getClinics');
		return await this.clinicService.getClinics(input);
	}

	// Anyone — views a single clinic (public)
	@Query(() => Clinic)
	public async getClinic(
		@Args('clinicId') clinicId: string,
	): Promise<Clinic> {
		console.log('Query: getClinic');
		return await this.clinicService.getClinic(clinicId as unknown as ObjectId);
	}

	// CLINIC role — which clinic is "mine" (via token, no args)
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Query(() => Clinic)
	public async getMyClinic(
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Clinic> {
		console.log('Query: getMyClinic');
		return await this.clinicService.getMyClinic(ownerId);
	}

	// CLINIC role — updates its own clinic
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Mutation(() => Clinic)
	public async updateClinic(
		@Args('clinicId') clinicId: string,
		@Args('input') input: ClinicInput,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Clinic> {
		console.log('Mutation: updateClinic');
		return await this.clinicService.updateClinic(
			ownerId,
			clinicId as unknown as ObjectId,
			input,
		);
	}

	// ADMIN — approves / suspends a clinic
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Clinic)
	public async updateClinicStatus(
		@Args('clinicId') clinicId: string,
		@Args('status', { type: () => ClinicStatus }) status: ClinicStatus,
	): Promise<Clinic> {
		console.log('Mutation: updateClinicStatus');
		return await this.clinicService.updateClinicStatus(
			clinicId as unknown as ObjectId,
			status,
		);
	}

	// ADMIN — the review queue / all-clinics table
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Clinics)
	public async getClinicsForAdmin(
		@Args('input') input: ClinicsAdminInquiry,
	): Promise<Clinics> {
		console.log('Query: getClinicsForAdmin');
		return await this.clinicService.getClinicsForAdmin(input);
	}

	// ADMIN — dashboard tile counts
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => ClinicStatusCounts)
	public async getClinicStatusCounts(): Promise<ClinicStatusCounts> {
		console.log('Query: getClinicStatusCounts');
		return await this.clinicService.getClinicStatusCounts();
	}

	@ResolveField('owner', () => Member)
	async resolveOwner(@Parent() clinic: Clinic): Promise<Member> {
		return this.memberService.getMember(clinic.clinicOwnerId as unknown as ObjectId);
	}
}
