import { Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
	MemberType,
	MemberStatus,
	MemberCountry,
	MemberLang,
} from '../enums/member.enum';

const MemberSchema = new Schema(
	{
		memberType: {
			type: String,
			enum: MemberType,
			default: MemberType.PATIENT,
		},
		memberStatus: {
			type: String,
			enum: MemberStatus,
			default: MemberStatus.ACTIVE,
		},
		memberEmail: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		memberPassword: {
			type: String,
			required: true,
			select: false, // excluded from queries by default (security)
		},
		memberNick: {
			type: String,
			required: true,
		},
		memberPhone: {
			type: String,
			required: true,
		},
		memberFullName: {
			type: String,
		},
		memberImage: {
			type: String,
			default: '',
		},
		memberCountry: {
			type: String,
			enum: MemberCountry,
		},
		memberLang: {
			type: String,
			enum: MemberLang,
			default: MemberLang.EN,
		},
		memberClinicId: {
			type: Schema.Types.ObjectId,
			ref: 'Clinic',
			default: null,
		},
	},
	{ timestamps: true }, // createdAt / updatedAt handled automatically
);

MemberSchema.pre('save', async function () {
	if (!this.isModified('memberPassword')) return;
	this.memberPassword = await bcrypt.hash(this.memberPassword, 10);
});

export default MemberSchema;
