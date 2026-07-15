import { registerEnumType } from '@nestjs/graphql';

export enum ProcedureCategory {
	FACE = 'FACE',
	BODY = 'BODY',
	SKIN = 'SKIN',
	DENTAL = 'DENTAL',
	HAIR = 'HAIR',
	EYE = 'EYE',
}
registerEnumType(ProcedureCategory, { name: 'ProcedureCategory' });

export enum ProcedureCurrency {
	USD = 'USD',
	KRW = 'KRW',
}
registerEnumType(ProcedureCurrency, { name: 'ProcedureCurrency' });
