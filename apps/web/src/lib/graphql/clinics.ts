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

const GET_CLINICS_QUERY = `
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

// Server-side fetch (for Server Components, e.g. the landing page's Featured
// Clinics section) — same query as GET_CLINICS above, but run via a plain
// fetch instead of Apollo's browser-oriented client. Mirrors the pattern in
// lib/graphql/clinic-profile.ts.
export async function fetchClinics(input: ClinicsInquiry): Promise<{ list: Clinic[]; total: number }> {
	const res = await fetch(process.env.NEXT_PUBLIC_GATEWAY_URL as string, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: GET_CLINICS_QUERY, variables: { input } }),
		cache: 'no-store',
	});

	const json = (await res.json()) as { data: GetClinicsData | null };
	return json.data?.getClinics ?? { list: [], total: 0 };
}
