import { registerEnumType } from '@nestjs/graphql';

export enum ClinicStatus {
	PENDING = 'PENDING', // new, awaiting admin approval
	VERIFIED = 'VERIFIED', // approved, visible to patients
	SUSPENDED = 'SUSPENDED', // temporarily suspended
}
registerEnumType(ClinicStatus, { name: 'ClinicStatus' });

export enum ClinicSpecialty {
	PLASTIC_SURGERY = 'PLASTIC_SURGERY',
	DERMATOLOGY = 'DERMATOLOGY',
	DENTAL = 'DENTAL',
	OPHTHALMOLOGY = 'OPHTHALMOLOGY', // eye care
	HAIR_TRANSPLANT = 'HAIR_TRANSPLANT',
	ORTHOPEDICS = 'ORTHOPEDICS',
}
registerEnumType(ClinicSpecialty, { name: 'ClinicSpecialty' });

export enum ClinicSort {
	TOP_RATED = 'TOP_RATED', // highest clinicRating first (default)
	MOST_REVIEWED = 'MOST_REVIEWED', // highest clinicReviewCount first
	PRICE_LOW = 'PRICE_LOW', // cheapest procedure first
	PRICE_HIGH = 'PRICE_HIGH', // most expensive procedure first
}
registerEnumType(ClinicSort, { name: 'ClinicSort' });
