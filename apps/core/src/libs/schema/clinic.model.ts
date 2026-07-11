import { Schema } from 'mongoose';
import { ClinicStatus, ClinicSpecialty } from '../enums/clinic.enum';
import { MemberLang } from '../enums/member.enum';

const ClinicSchema = new Schema(
	{
		clinicName: {
			type: String,
			required: true,
		},
		clinicStatus: {
			type: String,
			enum: ClinicStatus,
			default: ClinicStatus.PENDING, // new clinic — starts in pending state
		},
		clinicDesc: {
			type: String,
			default: '',
		},
		clinicAddress: {
			type: String,
			required: true,
		},
		clinicImages: {
			type: [String],
			default: [],
		},
		clinicSpecialties: {
			type: [String],
			enum: ClinicSpecialty,
			required: true,
		},
		clinicRating: {
			type: Number,
			default: 0,
		},
		clinicReviewCount: {
			type: Number,
			default: 0,
		},
		clinicLicenses: {
			type: [String],
			default: [],
		},
		clinicLangs: {
			type: [String],
			enum: MemberLang,
			default: [],
		},
		clinicOwnerId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},
	},
	{ timestamps: true },
);

ClinicSchema.index({ clinicStatus: 1, clinicSpecialties: 1 });

export default ClinicSchema;
