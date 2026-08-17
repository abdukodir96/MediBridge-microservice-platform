import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	Length,
	IsArray,
	ArrayNotEmpty,
	Min,
	Max,
	IsEnum,
} from 'class-validator';
import { ClinicSpecialty, ClinicSort, ClinicStatus } from '../../enums/clinic.enum';
import { MemberLang } from '../../enums/member.enum';

// Create a clinic
@InputType()
export class ClinicInput {
	@IsNotEmpty()
	@Length(2, 100)
	@Field(() => String)
	clinicName: string;

	@IsNotEmpty()
	@Field(() => String)
	clinicAddress: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	clinicDesc?: string;

	@IsArray()
	@ArrayNotEmpty()
	@Field(() => [ClinicSpecialty])
	clinicSpecialties: ClinicSpecialty[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	clinicImages?: string[];

	@IsOptional()
	@Field(() => [MemberLang], { nullable: true })
	clinicLangs?: MemberLang[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	clinicLicenses?: string[];
}

// Search / filter (for patients)
@InputType()
export class ClinicsInquiry {
	@IsOptional()
	@IsArray()
	@Field(() => [ClinicSpecialty], { nullable: true })
	specialties?: ClinicSpecialty[];

	@IsOptional()
	@Field(() => [MemberLang], { nullable: true })
	langs?: MemberLang[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string; // search by name

	@IsOptional()
	@IsArray()
	@Field(() => [String], { nullable: true })
	locations?: string[];

	@IsOptional()
	@Min(0)
	@Field(() => Float, { nullable: true })
	priceMin?: number;

	@IsOptional()
	@Min(0)
	@Field(() => Float, { nullable: true })
	priceMax?: number;

	@IsOptional()
	@IsEnum(ClinicSort)
	@Field(() => ClinicSort, { nullable: true })
	sort?: ClinicSort;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true, defaultValue: 1 })
	page?: number;

	@IsOptional()
	@Min(1)
	@Max(50)
	@Field(() => Int, { nullable: true, defaultValue: 10 })
	limit?: number;
}

// ADMIN — the review queue / all-clinics table (no VERIFIED filter, unlike
// ClinicsInquiry, plus a status filter to drive the Pending/Verified/
// Suspended tabs)
@InputType()
export class ClinicsAdminInquiry {
	@IsOptional()
	@IsEnum(ClinicStatus)
	@Field(() => ClinicStatus, { nullable: true })
	status?: ClinicStatus;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true, defaultValue: 1 })
	page?: number;

	@IsOptional()
	@Min(1)
	@Max(50)
	@Field(() => Int, { nullable: true, defaultValue: 20 })
	limit?: number;
}
