import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, isValidObjectId } from 'mongoose';
import { Clinic, Clinics } from '../../libs/dto/clinic/clinic';
import { Procedure } from '../../libs/dto/procedure/procedure';
import { ClinicInput, ClinicsInquiry } from '../../libs/dto/clinic/clinic.input';
import { ClinicStatus, ClinicSort } from '../../libs/enums/clinic.enum';

// Escapes regex special characters so user search input is matched literally,
// not interpreted as a regex pattern (prevents ReDoS / regex injection)
const escapeRegex = (text: string): string =>
	text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertValidObjectId = (id: ObjectId | string): void => {
	if (!isValidObjectId(id)) {
		throw new BadRequestException('Invalid clinic id');
	}
};

const assertPriceRange = (min?: number, max?: number): void => {
	if (min != null && max != null && max < min) {
		throw new BadRequestException('priceMax cannot be lower than priceMin');
	}
};

// Sort key per ClinicSort option. PRICE_LOW/PRICE_HIGH sort by the clinic's
// cheapest procedure (clinicMinPrice), computed via $lookup — see getClinics.
// Every entry ends with `_id: 1` as a tiebreaker: without one, documents that
// tie on the primary key (e.g. many clinics sharing clinicRating: 4.9) have
// no guaranteed relative order across separate paginated queries, so the
// same clinic can reappear on multiple pages or vanish between them.
const SORT_MAP: Record<ClinicSort, Record<string, 1 | -1>> = {
	[ClinicSort.TOP_RATED]: { clinicRating: -1, _id: 1 },
	[ClinicSort.MOST_REVIEWED]: { clinicReviewCount: -1, _id: 1 },
	[ClinicSort.PRICE_LOW]: { clinicMinPrice: 1, _id: 1 },
	[ClinicSort.PRICE_HIGH]: { clinicMinPrice: -1, _id: 1 },
};

@Injectable()
export class ClinicService {
	constructor(
		@InjectModel('Clinic') private readonly clinicModel: Model<Clinic>,
		@InjectModel('Procedure') private readonly procedureModel: Model<Procedure>,
	) {}

	// CLINIC role — creates a new clinic (starts in PENDING)
	public async createClinic(
		ownerId: ObjectId,
		input: ClinicInput,
	): Promise<Clinic> {
		try {
			const result = await this.clinicModel.create({
				...input,
				clinicOwnerId: ownerId,
			});
			return result;
		} catch (err) {
			const error = err as { message?: string };
			console.log('Error, createClinic:', error.message);
			throw new BadRequestException('Failed to create clinic');
		}
	}

	// Patient — views a single clinic (VERIFIED only)
	public async getClinic(clinicId: ObjectId): Promise<Clinic> {
		assertValidObjectId(clinicId);
		const clinic = await this.clinicModel
			.findOne({ _id: clinicId, clinicStatus: ClinicStatus.VERIFIED })
			.exec();
		if (!clinic) throw new NotFoundException('Clinic not found');
		return clinic;
	}

	// Patient — searches clinics (filter + sort + pagination, VERIFIED only).
	// Price filter/sort reach across into Procedure via $lookup, since price
	// lives on Procedure, not Clinic — a clinic matches the price window if at
	// least one of its procedures overlaps [priceMin, priceMax].
	public async getClinics(input: ClinicsInquiry): Promise<Clinics> {
		const {
			specialties,
			langs,
			text,
			priceMin,
			priceMax,
			sort = ClinicSort.TOP_RATED,
			page = 1,
			limit = 10,
		} = input;

		assertPriceRange(priceMin, priceMax);

		// Filter — only approved clinics
		const match: any = { clinicStatus: ClinicStatus.VERIFIED };
		if (specialties?.length) match.clinicSpecialties = { $in: specialties };
		if (langs?.length) match.clinicLangs = { $in: langs };
		if (text) match.clinicName = { $regex: escapeRegex(text), $options: 'i' };

		const skip = (page - 1) * limit;

		const pipeline: any[] = [{ $match: match }];

		// Only join procedures when price data is actually needed — keeps the
		// common case (no price filter, rating/review sort) a plain query.
		const needsProcedures =
			priceMin != null ||
			priceMax != null ||
			sort === ClinicSort.PRICE_LOW ||
			sort === ClinicSort.PRICE_HIGH;

		if (needsProcedures) {
			pipeline.push({
				$lookup: {
					from: this.procedureModel.collection.name,
					localField: '_id',
					foreignField: 'procedureClinicId',
					as: 'procedures',
				},
			});

			if (priceMin != null || priceMax != null) {
				// Overlap with the requested [priceMin, priceMax] window —
				// a clinic qualifies if any single procedure overlaps it.
				pipeline.push({
					$match: {
						procedures: {
							$elemMatch: {
								...(priceMin != null ? { procedurePriceMax: { $gte: priceMin } } : {}),
								...(priceMax != null ? { procedurePriceMin: { $lte: priceMax } } : {}),
							},
						},
					},
				});
			}

			pipeline.push({
				$addFields: { clinicMinPrice: { $min: '$procedures.procedurePriceMin' } },
			});
		}

		const [list, countResult] = await Promise.all([
			this.clinicModel
				.aggregate([
					...pipeline,
					{ $sort: SORT_MAP[sort] },
					{ $skip: skip },
					{ $limit: limit },
					{ $unset: ['procedures', 'clinicMinPrice'] },
				])
				.exec(),
			this.clinicModel.aggregate([...pipeline, { $count: 'total' }]).exec(),
		]);

		return { list, total: countResult[0]?.total ?? 0 };
	}

	// ADMIN — changes a clinic's status (approve / suspend)
	public async updateClinicStatus(
		clinicId: ObjectId,
		status: ClinicStatus,
	): Promise<Clinic> {
		assertValidObjectId(clinicId);
		const result = await this.clinicModel
			.findByIdAndUpdate(clinicId, { clinicStatus: status }, { new: true })
			.exec();
		if (!result) throw new NotFoundException('Clinic not found');
		return result;
	}

	// CLINIC role — updates its own clinic (owner only)
	public async updateClinic(
		ownerId: ObjectId,
		clinicId: ObjectId,
		input: Partial<ClinicInput>,
	): Promise<Clinic> {
		assertValidObjectId(clinicId);
		const result = await this.clinicModel
			.findOneAndUpdate(
				{ _id: clinicId, clinicOwnerId: ownerId }, // only its own clinic
				input,
				{ new: true },
			)
			.exec();
		if (!result) {
			throw new ForbiddenException('Clinic not found or not owned by you');
		}
		return result;
	}
}
