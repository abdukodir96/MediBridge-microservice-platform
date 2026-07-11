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
