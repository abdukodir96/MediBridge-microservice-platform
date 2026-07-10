import { registerEnumType } from '@nestjs/graphql';

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
	ZH = 'ZH', // Chinese
	JA = 'JA', // Japanese
	KO = 'KO', // Korean
}
registerEnumType(MemberLang, { name: 'MemberLang' });
