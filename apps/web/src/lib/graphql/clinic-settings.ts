import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import type { ClinicSpecialty, MemberLang } from "@/lib/graphql/clinics";

export interface ClinicInput {
	clinicName: string;
	clinicAddress: string;
	clinicDesc?: string;
	clinicSpecialties: ClinicSpecialty[];
	clinicImages?: string[];
	clinicLangs?: MemberLang[];
}

interface UpdateClinicData {
	updateClinic: {
		_id: string;
		clinicName: string;
		clinicAddress: string;
		clinicDesc: string;
		clinicSpecialties: ClinicSpecialty[];
		clinicLangs: MemberLang[];
		clinicImages: string[];
	};
}
interface UpdateClinicVars {
	clinicId: string;
	input: ClinicInput;
}

// Requesting clinicSpecialties/clinicLangs back (not just _id) is what lets
// Apollo's normalized cache update every other place useClinic()'s data is
// read from (sidebar identity, verification banner) — same pattern as the
// booking-requests mutations, and the fix for the earlier procedures cache bug.
export const UPDATE_CLINIC: TypedDocumentNode<UpdateClinicData, UpdateClinicVars> = gql`
	mutation UpdateClinic($clinicId: String!, $input: ClinicInput!) {
		updateClinic(clinicId: $clinicId, input: $input) {
			_id
			clinicName
			clinicAddress
			clinicDesc
			clinicSpecialties
			clinicLangs
			clinicImages
		}
	}
`;
