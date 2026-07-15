import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ProcedureCategory, ProcedureCurrency } from '../../enums/procedure.enum';

@ObjectType()
export class Procedure {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	procedureName: string;

	@Field(() => ProcedureCategory)
	procedureCategory: ProcedureCategory;

	@Field(() => String)
	procedureDesc: string;

	@Field(() => Float)
	procedurePriceMin: number;

	@Field(() => Float)
	procedurePriceMax: number;

	@Field(() => ProcedureCurrency)
	procedureCurrency: ProcedureCurrency;

	@Field(() => Int)
	procedureDuration: number;

	@Field(() => [String])
	procedureImages: string[];

	@Field(() => String)
	procedureClinicId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

// Ro'yxat (klinika procedure'lari)
@ObjectType()
export class Procedures {
	@Field(() => [Procedure])
	list: Procedure[];

	@Field(() => Int)
	total: number;
}
