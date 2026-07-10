import { Field, InputType } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	Length,
	IsEmail,
	IsEnum,
} from 'class-validator';
import { MemberType, MemberCountry, MemberLang } from '../../enums/member.enum';

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
	@IsEnum(MemberType)
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
