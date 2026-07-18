import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	Length,
	IsArray,
	Min,
	Max,
	IsEnum,
} from 'class-validator';
import { ClinicSpecialty, ClinicSort } from '../../enums/clinic.enum';
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

	@IsNotEmpty()
	@IsArray()
	@Field(() => [ClinicSpecialty])
	clinicSpecialties: ClinicSpecialty[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	clinicImages?: string[];

	@IsOptional()
	@Field(() => [MemberLang], { nullable: true })
	clinicLangs?: MemberLang[];
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
