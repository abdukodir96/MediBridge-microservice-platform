import { Schema } from 'mongoose';
import { ProcedureCategory, ProcedureCurrency } from '../enums/procedure.enum';

const ProcedureSchema = new Schema(
	{
		procedureName: {
			type: String,
			required: true,
		},
		procedureCategory: {
			type: String,
			enum: ProcedureCategory,
			required: true,
		},
		procedureDesc: {
			type: String,
			default: '',
		},
		procedurePriceMin: {
			type: Number,
			required: true,
		},
		procedurePriceMax: {
			type: Number,
			required: true,
		},
		procedureCurrency: {
			type: String,
			enum: ProcedureCurrency,
			default: ProcedureCurrency.USD,
		},
		procedureDuration: {
			type: Number, // operatsiya + tiklanish kunlari
			default: 0,
		},
		procedureImages: {
			type: [String],
			default: [],
		},
		procedureClinicId: {
			type: Schema.Types.ObjectId,
			ref: 'Clinic',
			required: true,
		},
	},
	{ timestamps: true },
);

ProcedureSchema.index({ procedureClinicId: 1 });

export default ProcedureSchema;
