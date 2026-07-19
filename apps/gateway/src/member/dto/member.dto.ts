import { Field, ObjectType, InputType, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, IsEmail, IsEnum, IsIn } from 'class-validator';

export enum MemberType {
	PATIENT = 'PATIENT',
	CLINIC = 'CLINIC',
	ADMIN = 'ADMIN',
}
registerEnumType(MemberType, { name: 'MemberType' });

export enum MemberStatus {
	ACTIVE = 'ACTIVE',
	BLOCKED = 'BLOCKED',
	DELETED = 'DELETED',
}
registerEnumType(MemberStatus, { name: 'MemberStatus' });

export enum MemberCountry {
	CHINA = 'CHINA',
	JAPAN = 'JAPAN',
	USA = 'USA',
	VIETNAM = 'VIETNAM',
	THAILAND = 'THAILAND',
	OTHER = 'OTHER',
}
registerEnumType(MemberCountry, { name: 'MemberCountry' });

export enum MemberLang {
	EN = 'EN',
	ZH = 'ZH',
	JA = 'JA',
	KO = 'KO',
}
registerEnumType(MemberLang, { name: 'MemberLang' });

@ObjectType()
export class Member {
	@Field(() => String)
	_id: string;

	@Field(() => MemberType)
	memberType: MemberType;

	@Field(() => MemberStatus)
	memberStatus: MemberStatus;

	@Field(() => String)
	memberEmail: string;

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

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => String, { nullable: true })
	accessToken?: string;
}

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
	@IsIn([MemberType.PATIENT, MemberType.CLINIC])
	@Field(() => MemberType, { nullable: true })
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
