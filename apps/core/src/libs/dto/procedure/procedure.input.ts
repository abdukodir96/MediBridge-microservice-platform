import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	IsArray,
	Length,
	Min,
	Max,
	IsEnum,
} from 'class-validator';
import {
	ProcedureCategory,
	ProcedureCurrency,
	ProcedureSort,
} from '../../enums/procedure.enum';

// Procedure yaratish
@InputType()
export class ProcedureInput {
	@IsNotEmpty()
	@Length(2, 100)
	@Field(() => String)
	procedureName: string;

	@IsNotEmpty()
	@IsEnum(ProcedureCategory)
	@Field(() => ProcedureCategory)
	procedureCategory: ProcedureCategory;

	@IsOptional()
	@Field(() => String, { nullable: true })
	procedureDesc?: string;

	@IsNotEmpty()
	@Min(0)
	@Field(() => Float)
	procedurePriceMin: number;

	@IsNotEmpty()
	@Min(0)
	@Field(() => Float)
	procedurePriceMax: number;

	@IsOptional()
	@IsEnum(ProcedureCurrency)
	@Field(() => ProcedureCurrency, { nullable: true })
	procedureCurrency?: ProcedureCurrency;

	@IsOptional()
	@Min(0)
	@Field(() => Int, { nullable: true })
	procedureDuration?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	procedureImages?: string[];

	// Qaysi klinikaga qo'shilishini bildiradi
	@IsNotEmpty()
	@Field(() => String)
	procedureClinicId: string;
}

// Search / filter (for patients) — only surfaces procedures of VERIFIED clinics
@InputType()
export class ProceduresInquiry {
	@IsOptional()
	@IsArray()
	@Field(() => [ProcedureCategory], { nullable: true })
	categories?: ProcedureCategory[];

	@IsOptional()
	@Min(0)
	@Field(() => Float, { nullable: true })
	priceMin?: number;

	@IsOptional()
	@Min(0)
	@Field(() => Float, { nullable: true })
	priceMax?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string; // search by name

	@IsOptional()
	@IsEnum(ProcedureSort)
	@Field(() => ProcedureSort, { nullable: true })
	sort?: ProcedureSort;

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
