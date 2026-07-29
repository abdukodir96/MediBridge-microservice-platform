import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import type { MemberLang } from "@/lib/graphql/clinics";

export type MemberCountry = "CHINA" | "JAPAN" | "USA" | "VIETNAM" | "THAILAND" | "OTHER";

export interface ClinicReview {
	_id: string;
	reviewRating: number;
	reviewText: string;
	createdAt: string;
	patient: {
		memberNick: string;
		memberCountry?: MemberCountry;
		memberLang: MemberLang;
	};
}

interface GetReviewsByClinicData {
	getReviewsByClinic: { list: ClinicReview[]; total: number };
}
interface GetReviewsByClinicVars {
	clinicId: string;
	input: { page?: number; limit?: number };
}

// Two separate args (clinicId, input) — NOT nested inside one input object.
export const GET_REVIEWS_BY_CLINIC: TypedDocumentNode<GetReviewsByClinicData, GetReviewsByClinicVars> = gql`
	query GetReviewsByClinic($clinicId: String!, $input: ReviewsInquiry!) {
		getReviewsByClinic(clinicId: $clinicId, input: $input) {
			total
			list {
				_id
				reviewRating
				reviewText
				createdAt
				patient {
					memberNick
					memberCountry
					memberLang
				}
			}
		}
	}
`;

export interface ReviewInput {
	reviewBookingId: string;
	reviewRating: number;
	reviewText?: string;
}

interface CreateReviewData {
	createReview: { _id: string; reviewRating: number; reviewText: string };
}
interface CreateReviewVars {
	input: ReviewInput;
}

export const CREATE_REVIEW: TypedDocumentNode<CreateReviewData, CreateReviewVars> = gql`
	mutation CreateReview($input: ReviewInput!) {
		createReview(input: $input) {
			_id
			reviewRating
			reviewText
		}
	}
`;
