import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, isValidObjectId } from 'mongoose';
import { Procedure, Procedures } from '../../libs/dto/procedure/procedure';
import { ProcedureInput } from '../../libs/dto/procedure/procedure.input';
import { Clinic } from '../../libs/dto/clinic/clinic';

const assertValidObjectId = (id: ObjectId | string): void => {
	if (!isValidObjectId(id)) {
		throw new BadRequestException('Invalid procedure id');
	}
};

const assertPriceRange = (min?: number, max?: number): void => {
	if (min != null && max != null && max < min) {
		throw new BadRequestException(
			'procedurePriceMax cannot be lower than procedurePriceMin',
		);
	}
};

@Injectable()
export class ProcedureService {
	constructor(
		@InjectModel('Procedure') private readonly procedureModel: Model<Procedure>,
		@InjectModel('Clinic') private readonly clinicModel: Model<Clinic>,
	) {}

	// CLINIC role — adds a procedure to its own clinic
	public async createProcedure(
		ownerId: ObjectId,
		input: ProcedureInput,
	): Promise<Procedure> {
		assertPriceRange(input.procedurePriceMin, input.procedurePriceMax);

		// OWNERSHIP: does this clinic actually belong to the caller?
		if (!isValidObjectId(input.procedureClinicId)) {
			throw new BadRequestException('Invalid clinic id');
		}
		const clinicId = input.procedureClinicId as unknown as ObjectId;
		const clinic = await this.clinicModel
			.findOne({ _id: clinicId, clinicOwnerId: ownerId })
			.exec();
		if (!clinic) {
			throw new ForbiddenException('Clinic not found or not owned by you');
		}

		try {
			const result = await this.procedureModel.create({
				...input,
				procedureClinicId: clinicId,
			});
			return result;
		} catch (err) {
			const error = err as { message?: string };
			console.log('Error, createProcedure:', error.message);
			throw new BadRequestException('Failed to create procedure');
		}
	}

	// Anyone — lists procedures of a given clinic
	public async getProceduresByClinic(clinicId: ObjectId): Promise<Procedures> {
		assertValidObjectId(clinicId);
		const [list, total] = await Promise.all([
			this.procedureModel
				.find({ procedureClinicId: clinicId })
				.sort({ createdAt: -1 })
				.exec(),
			this.procedureModel.countDocuments({ procedureClinicId: clinicId }),
		]);

		return { list, total };
	}

	// Anyone — views a single procedure
	public async getProcedure(procedureId: ObjectId): Promise<Procedure> {
		assertValidObjectId(procedureId);
		const procedure = await this.procedureModel.findById(procedureId).exec();
		if (!procedure) throw new NotFoundException('Procedure not found');
		return procedure;
	}

	// CLINIC role — updates its own procedure
	public async updateProcedure(
		ownerId: ObjectId,
		procedureId: ObjectId,
		input: Partial<ProcedureInput>,
	): Promise<Procedure> {
		assertValidObjectId(procedureId);
		assertPriceRange(input.procedurePriceMin, input.procedurePriceMax);

		const procedure = await this.procedureModel.findById(procedureId).exec();
		if (!procedure) throw new NotFoundException('Procedure not found');

		// OWNERSHIP: does the procedure's clinic belong to the caller?
		const clinic = await this.clinicModel
			.findOne({ _id: procedure.procedureClinicId, clinicOwnerId: ownerId })
			.exec();
		if (!clinic) {
			throw new ForbiddenException('This procedure does not belong to you');
		}

		// Reassigning a procedure to a different clinic isn't a supported
		// update — silently ignore it instead of trusting the caller-supplied
		// id (it isn't checked for ownership like the current clinic is).
		const { procedureClinicId: _ignored, ...safeInput } = input;

		const result = await this.procedureModel
			.findByIdAndUpdate(procedureId, safeInput, { new: true })
			.exec();
		return result as Procedure;
	}

	// CLINIC role — deletes its own procedure
	public async deleteProcedure(
		ownerId: ObjectId,
		procedureId: ObjectId,
	): Promise<Procedure> {
		assertValidObjectId(procedureId);

		const procedure = await this.procedureModel.findById(procedureId).exec();
		if (!procedure) throw new NotFoundException('Procedure not found');

		// OWNERSHIP check
		const clinic = await this.clinicModel
			.findOne({ _id: procedure.procedureClinicId, clinicOwnerId: ownerId })
			.exec();
		if (!clinic) {
			throw new ForbiddenException('This procedure does not belong to you');
		}

		const result = await this.procedureModel
			.findByIdAndDelete(procedureId)
			.exec();
		return result as Procedure;
	}
}
