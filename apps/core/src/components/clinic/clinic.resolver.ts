import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ClinicService } from './clinic.service';
import { Clinic, Clinics } from '../../libs/dto/clinic/clinic';
import { ClinicInput, ClinicsInquiry } from '../../libs/dto/clinic/clinic.input';
import { ClinicStatus } from '../../libs/enums/clinic.enum';
import { RolesGuard } from '../../libs/auth/guards/roles.guard';
import { Roles } from '../../libs/auth/decorators/roles.decorator';
import { AuthMember } from '../../libs/auth/decorators/auth-member.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class ClinicResolver {
	constructor(private readonly clinicService: ClinicService) {}

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
}
