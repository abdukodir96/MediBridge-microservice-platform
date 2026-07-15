import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ProcedureService } from './procedure.service';
import { Procedure, Procedures } from '../../libs/dto/procedure/procedure';
import {
	ProcedureInput,
	ProceduresInquiry,
} from '../../libs/dto/procedure/procedure.input';
import { RolesGuard } from '../../libs/auth/guards/roles.guard';
import { Roles } from '../../libs/auth/decorators/roles.decorator';
import { AuthMember } from '../../libs/auth/decorators/auth-member.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class ProcedureResolver {
	constructor(private readonly procedureService: ProcedureService) {}

	// CLINIC role — adds a procedure to its own clinic
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Mutation(() => Procedure)
	public async createProcedure(
		@Args('input') input: ProcedureInput,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Procedure> {
		console.log('Mutation: createProcedure');
		return await this.procedureService.createProcedure(ownerId, input);
	}

	// Anyone — searches procedures across all clinics (filter + pagination)
	@Query(() => Procedures)
	public async getProcedures(
		@Args('input') input: ProceduresInquiry,
	): Promise<Procedures> {
		console.log('Query: getProcedures');
		return await this.procedureService.getProcedures(input);
	}

	// Anyone — lists a clinic's procedures
	@Query(() => Procedures)
	public async getProceduresByClinic(
		@Args('clinicId') clinicId: string,
	): Promise<Procedures> {
		console.log('Query: getProceduresByClinic');
		return await this.procedureService.getProceduresByClinic(
			clinicId as unknown as ObjectId,
		);
	}

	// Anyone — views a single procedure
	@Query(() => Procedure)
	public async getProcedure(
		@Args('procedureId') procedureId: string,
	): Promise<Procedure> {
		console.log('Query: getProcedure');
		return await this.procedureService.getProcedure(
			procedureId as unknown as ObjectId,
		);
	}

	// CLINIC role — updates its own procedure
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Mutation(() => Procedure)
	public async updateProcedure(
		@Args('procedureId') procedureId: string,
		@Args('input') input: ProcedureInput,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Procedure> {
		console.log('Mutation: updateProcedure');
		return await this.procedureService.updateProcedure(
			ownerId,
			procedureId as unknown as ObjectId,
			input,
		);
	}

	// CLINIC role — deletes its own procedure
	@Roles(MemberType.CLINIC)
	@UseGuards(RolesGuard)
	@Mutation(() => Procedure)
	public async deleteProcedure(
		@Args('procedureId') procedureId: string,
		@AuthMember('_id') ownerId: ObjectId,
	): Promise<Procedure> {
		console.log('Mutation: deleteProcedure');
		return await this.procedureService.deleteProcedure(
			ownerId,
			procedureId as unknown as ObjectId,
		);
	}
}
