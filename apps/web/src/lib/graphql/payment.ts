import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";

interface PayBookingData {
	payBooking: { _id: string; bookingStatus: string; bookingAmount?: number };
}
interface PayBookingVars {
	bookingId: string;
}

export const PAY_BOOKING: TypedDocumentNode<PayBookingData, PayBookingVars> = gql`
	mutation PayBooking($bookingId: String!) {
		payBooking(bookingId: $bookingId) {
			_id
			bookingStatus
			bookingAmount
		}
	}
`;

interface ConfirmCompletionData {
	confirmCompletion: { _id: string; bookingStatus: string };
}
interface ConfirmCompletionVars {
	bookingId: string;
}

export const CONFIRM_COMPLETION: TypedDocumentNode<ConfirmCompletionData, ConfirmCompletionVars> = gql`
	mutation ConfirmCompletion($bookingId: String!) {
		confirmCompletion(bookingId: $bookingId) {
			_id
			bookingStatus
		}
	}
`;
