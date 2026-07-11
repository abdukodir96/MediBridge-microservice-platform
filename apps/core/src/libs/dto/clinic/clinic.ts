import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ClinicStatus, ClinicSpecialty } from '../../enums/clinic.enum';
import { MemberLang } from '../../enums/member.enum';

@ObjectType()
export class Clinic {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	clinicName: string;

	@Field(() => ClinicStatus)
	clinicStatus: ClinicStatus;

	@Field(() => String)
	clinicDesc: string;

	@Field(() => String)
	clinicAddress: string;

	@Field(() => [String])
	clinicImages: string[];

	@Field(() => [ClinicSpecialty])
	clinicSpecialties: ClinicSpecialty[];

	@Field(() => Float)
	clinicRating: number;

	@Field(() => Int)
	clinicReviewCount: number;

	@Field(() => [String])
	clinicLicenses: string[];

	@Field(() => [MemberLang])
	clinicLangs: MemberLang[];

	@Field(() => String)
	clinicOwnerId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

// List + total count (for pagination)
@ObjectType()
export class Clinics {
	@Field(() => [Clinic])
	list: Clinic[];

	@Field(() => Int)
	total: number;
}
