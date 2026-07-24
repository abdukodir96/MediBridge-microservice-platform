import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import type { MemberLang } from "@/lib/graphql/clinics";

export type BookingStatus = "REQUESTED" | "CONFIRMED" | "PAID" | "COMPLETED" | "CANCELLED";
export type MemberCountry = "CHINA" | "JAPAN" | "USA" | "VIETNAM" | "THAILAND" | "OTHER";

export interface ClinicBooking {
	_id: string;
	bookingStatus: BookingStatus;
	bookingPreferredDate: string;
	bookingConfirmedDate?: string;
	bookingAmount?: number;
	bookingCurrency?: string;
	bookingNote: string;
	patient: {
		memberNick: string;
		memberCountry?: MemberCountry;
		memberLang: MemberLang;
	};
	procedure: {
		procedureName: string;
		procedurePriceMin: number;
	};
}

interface GetClinicBookingsData {
	getClinicBookings: { list: ClinicBooking[]; total: number };
}
interface GetClinicBookingsVars {
	input: { status?: BookingStatus; page?: number; limit?: number };
}

export const GET_CLINIC_BOOKINGS: TypedDocumentNode<GetClinicBookingsData, GetClinicBookingsVars> = gql`
	query GetClinicBookings($input: BookingsInquiry!) {
		getClinicBookings(input: $input) {
			total
			list {
				_id
				bookingStatus
				bookingPreferredDate
				bookingConfirmedDate
				bookingAmount
				bookingCurrency
				bookingNote
				patient {
					memberNick
					memberCountry
					memberLang
				}
				procedure {
					procedureName
					procedurePriceMin
				}
			}
		}
	}
`;

interface BookingActionData {
	booking: { _id: string; bookingStatus: BookingStatus; bookingAmount?: number };
}
interface BookingActionVars {
	bookingId: string;
}

// Requesting the fields that actually change (bookingStatus, bookingAmount)
// is what lets Apollo's normalized cache update the list in place — no
// refetch/fetchPolicy workaround needed, unlike the procedures list earlier.
export const CONFIRM_BOOKING: TypedDocumentNode<{ confirmBooking: BookingActionData["booking"] }, BookingActionVars> = gql`
	mutation ConfirmBooking($bookingId: String!) {
		confirmBooking(bookingId: $bookingId) {
			_id
			bookingStatus
			bookingAmount
			bookingCurrency
			bookingConfirmedDate
		}
	}
`;

export const CANCEL_BOOKING: TypedDocumentNode<{ cancelBooking: BookingActionData["booking"] }, BookingActionVars> = gql`
	mutation CancelBooking($bookingId: String!) {
		cancelBooking(bookingId: $bookingId) {
			_id
			bookingStatus
		}
	}
`;

export const COMPLETE_BOOKING: TypedDocumentNode<{ completeBooking: BookingActionData["booking"] }, BookingActionVars> = gql`
	mutation CompleteBooking($bookingId: String!) {
		completeBooking(bookingId: $bookingId) {
			_id
			bookingStatus
		}
	}
`;
