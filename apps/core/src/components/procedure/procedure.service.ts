import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, isValidObjectId } from 'mongoose';
import { Procedure, Procedures } from '../../libs/dto/procedure/procedure';
import {
	ProcedureInput,
	ProceduresInquiry,
} from '../../libs/dto/procedure/procedure.input';
import { Clinic } from '../../libs/dto/clinic/clinic';
import { ClinicStatus } from '../../libs/enums/clinic.enum';
import { ProcedureSort } from '../../libs/enums/procedure.enum';

const SORT_MAP: Record<ProcedureSort, Record<string, 1 | -1>> = {
	[ProcedureSort.PRICE_LOW]: { procedurePriceMin: 1 },
	[ProcedureSort.PRICE_HIGH]: { procedurePriceMin: -1 },
	[ProcedureSort.NEWEST]: { createdAt: -1 },
};

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

// Escapes regex special characters so user search input is matched literally,
// not interpreted as a regex pattern (prevents ReDoS / regex injection)
const escapeRegex = (text: string): string =>
	text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

	// Anyone — lists procedures of a given clinic (VERIFIED clinics only,
	// same visibility rule as getClinic/getClinics)
	public async getProceduresByClinic(clinicId: ObjectId): Promise<Procedures> {
		assertValidObjectId(clinicId);
		const clinic = await this.clinicModel
			.findOne({ _id: clinicId, clinicStatus: ClinicStatus.VERIFIED })
			.exec();
		if (!clinic) throw new NotFoundException('Clinic not found');

		const [list, total] = await Promise.all([
			this.procedureModel
				.find({ procedureClinicId: clinicId })
				.sort({ createdAt: -1 })
				.exec(),
			this.procedureModel.countDocuments({ procedureClinicId: clinicId }),
		]);

		return { list, total };
	}

	// Anyone — searches procedures across all clinics (filter + pagination,
	// only surfaces procedures belonging to VERIFIED clinics)
	public async getProcedures(input: ProceduresInquiry): Promise<Procedures> {
		const {
			categories,
			priceMin,
			priceMax,
			text,
			sort = ProcedureSort.NEWEST,
			page = 1,
			limit = 10,
		} = input;

		const match: any = {};
		if (categories?.length) match.procedureCategory = { $in: categories };
		// Overlap with the requested [priceMin, priceMax] window
		if (priceMin != null) match.procedurePriceMax = { $gte: priceMin };
		if (priceMax != null) match.procedurePriceMin = { $lte: priceMax };
		if (text) match.procedureName = { $regex: escapeRegex(text), $options: 'i' };

		const skip = (page - 1) * limit;

		const pipeline: any[] = [
			{ $match: match },
			{
				$lookup: {
					from: this.clinicModel.collection.name,
					localField: 'procedureClinicId',
					foreignField: '_id',
					as: 'clinic',
				},
			},
			{ $unwind: '$clinic' },
			{ $match: { 'clinic.clinicStatus': ClinicStatus.VERIFIED } },
		];

		const [list, countResult] = await Promise.all([
			this.procedureModel
				.aggregate([
					...pipeline,
					{ $sort: SORT_MAP[sort] },
					{ $skip: skip },
					{ $limit: limit },
					{ $unset: 'clinic' },
				])
				.exec(),
			this.procedureModel.aggregate([...pipeline, { $count: 'total' }]).exec(),
		]);

		return { list, total: countResult[0]?.total ?? 0 };
	}

	// Anyone — views a single procedure (VERIFIED clinics only, same
	// visibility rule as getClinic/getClinics)
	public async getProcedure(procedureId: ObjectId): Promise<Procedure> {
		assertValidObjectId(procedureId);
		const procedure = await this.procedureModel.findById(procedureId).exec();
		if (!procedure) throw new NotFoundException('Procedure not found');

		const clinic = await this.clinicModel
			.findOne({
				_id: procedure.procedureClinicId,
				clinicStatus: ClinicStatus.VERIFIED,
			})
			.exec();
		if (!clinic) throw new NotFoundException('Procedure not found');

		return procedure;
	}

	// CLINIC role — updates its own procedure
	public async updateProcedure(
		ownerId: ObjectId,
		procedureId: ObjectId,
		input: Partial<ProcedureInput>,
	): Promise<Procedure> {
		assertValidObjectId(procedureId);

		const procedure = await this.procedureModel.findById(procedureId).exec();
		if (!procedure) throw new NotFoundException('Procedure not found');

		// A partial update may only touch one of the two price fields — check
		// the resulting range (new value, or existing value if untouched) so a
		// one-field update can't leave priceMin > priceMax in the database.
		assertPriceRange(
			input.procedurePriceMin ?? procedure.procedurePriceMin,
			input.procedurePriceMax ?? procedure.procedurePriceMax,
		);

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
