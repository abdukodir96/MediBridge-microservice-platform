import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, isValidObjectId } from 'mongoose';
import { Clinic, Clinics } from '../../libs/dto/clinic/clinic';
import { ClinicInput, ClinicsInquiry } from '../../libs/dto/clinic/clinic.input';
import { ClinicStatus } from '../../libs/enums/clinic.enum';

// Escapes regex special characters so user search input is matched literally,
// not interpreted as a regex pattern (prevents ReDoS / regex injection)
const escapeRegex = (text: string): string =>
	text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertValidObjectId = (id: ObjectId | string): void => {
	if (!isValidObjectId(id)) {
		throw new BadRequestException('Invalid clinic id');
	}
};

@Injectable()
export class ClinicService {
	constructor(
		@InjectModel('Clinic') private readonly clinicModel: Model<Clinic>,
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

	// Patient — searches clinics (filter + pagination, VERIFIED only)
	public async getClinics(input: ClinicsInquiry): Promise<Clinics> {
		const { specialties, langs, text, page = 1, limit = 10 } = input;

		// Filter — only approved clinics
		const match: any = { clinicStatus: ClinicStatus.VERIFIED };
		if (specialties?.length) match.clinicSpecialties = { $in: specialties };
		if (langs?.length) match.clinicLangs = { $in: langs };
		if (text) match.clinicName = { $regex: escapeRegex(text), $options: 'i' };

		const skip = (page - 1) * limit;

		const [list, total] = await Promise.all([
			this.clinicModel
				.find(match)
				.sort({ clinicRating: -1 })
				.skip(skip)
				.limit(limit)
				.exec(),
			this.clinicModel.countDocuments(match),
		]);

		return { list, total };
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
