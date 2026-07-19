import { Field, InputType } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	Length,
	IsEmail,
	IsEnum,
	IsIn,
} from 'class-validator';
import { MemberCountry, MemberLang, MemberType } from '../../enums/member.enum';

// Self-service signup may only ever produce a PATIENT or a CLINIC account —
// ADMIN is deliberately excluded here and can only be created by the seed
// script, directly against the database.
const SIGNUP_MEMBER_TYPES = [MemberType.PATIENT, MemberType.CLINIC];

@InputType()
export class MemberInput {
	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	memberEmail: string;

	@IsNotEmpty()
	@Length(6, 30)
	@Field(() => String)
	memberPassword: string;

	@IsNotEmpty()
	@Length(2, 25)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsOptional()
	@IsIn(SIGNUP_MEMBER_TYPES)
	@Field(() => MemberType, { nullable: true, defaultValue: MemberType.PATIENT })
	memberType?: MemberType;

	@IsOptional()
	@IsEnum(MemberCountry)
	@Field(() => MemberCountry, { nullable: true })
	memberCountry?: MemberCountry;

	@IsOptional()
	@IsEnum(MemberLang)
	@Field(() => MemberLang, { nullable: true })
	memberLang?: MemberLang;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	memberEmail: string;

	@IsNotEmpty()
	@Length(6, 30)
	@Field(() => String)
	memberPassword: string;
}

@InputType()
export class UpdateMemberEmailInput {
	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	memberEmail: string;
}
