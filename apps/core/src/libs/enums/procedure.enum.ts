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

export enum ProcedureSort {
	PRICE_LOW = 'PRICE_LOW', // cheapest first
	PRICE_HIGH = 'PRICE_HIGH', // most expensive first
	NEWEST = 'NEWEST', // most recently added first
}
registerEnumType(ProcedureSort, { name: 'ProcedureSort' });
