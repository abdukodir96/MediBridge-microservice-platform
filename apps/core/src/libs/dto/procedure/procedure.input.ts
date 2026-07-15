import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	Length,
	Min,
	IsEnum,
} from 'class-validator';
import { ProcedureCategory, ProcedureCurrency } from '../../enums/procedure.enum';

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
