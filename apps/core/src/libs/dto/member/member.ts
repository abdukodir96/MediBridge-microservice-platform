import { Field, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import {
	MemberType,
	MemberStatus,
	MemberCountry,
	MemberLang,
} from '../../enums/member.enum';

@ObjectType()
export class Member {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => MemberType)
	memberType: MemberType;

	@Field(() => MemberStatus)
	memberStatus: MemberStatus;

	@Field(() => String)
	memberEmail: string;

	// memberPassword — NOTE: intentionally omitted, never returned to the client

	@Field(() => String)
	memberNick: string;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@Field(() => String, { nullable: true })
	memberImage?: string;

	@Field(() => MemberCountry, { nullable: true })
	memberCountry?: MemberCountry;

	@Field(() => MemberLang)
	memberLang: MemberLang;

	@Field(() => String, { nullable: true })
	memberClinicId?: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// Token added to the auth response (on login/signup)
	@Field(() => String, { nullable: true })
	accessToken?: string;
}
