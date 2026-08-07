import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import type { ClinicSpecialty, MemberLang } from "@/lib/graphql/clinics";

export type ClinicStatus = "PENDING" | "VERIFIED" | "SUSPENDED";

export interface AdminClinic {
	_id: string;
	clinicName: string;
	clinicAddress: string;
	clinicStatus: ClinicStatus;
	clinicSpecialties: ClinicSpecialty[];
	clinicLangs: MemberLang[];
	clinicLicenses: string[];
	clinicRating: number;
	clinicReviewCount: number;
	createdAt: string;
	owner: { _id: string; memberEmail: string };
}

interface ClinicStatusCountsData {
	getClinicStatusCounts: {
		pending: number;
		verified: number;
		suspended: number;
		total: number;
	};
}

export const GET_CLINIC_STATUS_COUNTS: TypedDocumentNode<ClinicStatusCountsData, Record<string, never>> = gql`
	query GetClinicStatusCounts {
		getClinicStatusCounts {
			pending
			verified
			suspended
			total
		}
	}
`;

interface GetClinicsForAdminData {
	getClinicsForAdmin: { list: AdminClinic[]; total: number };
}
interface GetClinicsForAdminVars {
	input: { status?: ClinicStatus; page?: number; limit?: number };
}

export const GET_CLINICS_FOR_ADMIN: TypedDocumentNode<GetClinicsForAdminData, GetClinicsForAdminVars> = gql`
	query GetClinicsForAdmin($input: ClinicsAdminInquiry!) {
		getClinicsForAdmin(input: $input) {
			total
			list {
				_id
				clinicName
				clinicAddress
				clinicStatus
				clinicSpecialties
				clinicLangs
				clinicLicenses
				clinicRating
				clinicReviewCount
				createdAt
				owner {
					_id
					memberEmail
				}
			}
		}
	}
`;

interface UpdateClinicStatusData {
	updateClinicStatus: { _id: string; clinicStatus: ClinicStatus };
}
interface UpdateClinicStatusVars {
	clinicId: string;
	status: ClinicStatus;
}

export const UPDATE_CLINIC_STATUS: TypedDocumentNode<UpdateClinicStatusData, UpdateClinicStatusVars> = gql`
	mutation UpdateClinicStatus($clinicId: String!, $status: ClinicStatus!) {
		updateClinicStatus(clinicId: $clinicId, status: $status) {
			_id
			clinicStatus
		}
	}
`;
