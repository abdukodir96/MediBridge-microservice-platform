import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import type { Clinic } from "@/lib/graphql/clinics";

interface GetMyClinicData {
	getMyClinic: Clinic;
}

// No variables — the backend resolves "my clinic" from the auth token
// (@AuthMember), not from an argument.
export const GET_MY_CLINIC: TypedDocumentNode<GetMyClinicData, Record<string, never>> = gql`
	query GetMyClinic {
		getMyClinic {
			_id
			clinicName
			clinicStatus
			clinicAddress
			clinicDesc
			clinicImages
			clinicSpecialties
			clinicLangs
			clinicRating
			clinicReviewCount
			startingPrice
		}
	}
`;
