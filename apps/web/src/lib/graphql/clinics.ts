import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

// ---- Enums (backend bilan bir xil qiymatlar) ----
export type ClinicSpecialty =
	| 'PLASTIC_SURGERY'
	| 'DERMATOLOGY'
	| 'DENTAL'
	| 'OPHTHALMOLOGY'
	| 'HAIR_TRANSPLANT'
	| 'ORTHOPEDICS';

export type MemberLang = 'EN' | 'ZH' | 'JA' | 'KO';

export type ClinicSort = 'TOP_RATED' | 'MOST_REVIEWED' | 'PRICE_LOW' | 'PRICE_HIGH';

// ---- Types (backend Clinic ObjectType bilan bir xil maydonlar) ----
export interface Clinic {
	_id: string;
	clinicName: string;
	clinicDesc: string;
	clinicAddress: string;
	clinicImages: string[];
	clinicSpecialties: ClinicSpecialty[];
	clinicRating: number;
	clinicReviewCount: number;
	clinicLangs: MemberLang[];
	startingPrice?: number | null;
}

export interface ClinicsInquiry {
	specialties?: ClinicSpecialty[];
	langs?: MemberLang[];
	text?: string;
	priceMin?: number;
	priceMax?: number;
	sort?: ClinicSort;
	page?: number;
	limit?: number;
}

interface GetClinicsData {
	getClinics: {
		list: Clinic[];
		total: number;
	};
}

interface GetClinicsVars {
	input: ClinicsInquiry;
}

export const GET_CLINICS: TypedDocumentNode<GetClinicsData, GetClinicsVars> = gql`
	query GetClinics($input: ClinicsInquiry!) {
		getClinics(input: $input) {
			total
			list {
				_id
				clinicName
				clinicDesc
				clinicAddress
				clinicImages
				clinicSpecialties
				clinicRating
				clinicReviewCount
				clinicLangs
				startingPrice
			}
		}
	}
`;
