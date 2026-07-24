import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export interface MyBooking {
	_id: string;
	bookingStatus: BookingStatus;
	bookingPreferredDate: string;
	bookingConfirmedDate?: string;
	bookingAmount?: number;
	bookingCurrency?: string;
	clinic: { clinicName: string };
	procedure: { procedureName: string };
}

interface GetMyBookingsData {
	getMyBookings: { list: MyBooking[]; total: number };
}
interface GetMyBookingsVars {
	input: { status?: BookingStatus; page?: number; limit?: number };
}

export const GET_MY_BOOKINGS: TypedDocumentNode<GetMyBookingsData, GetMyBookingsVars> = gql`
	query GetMyBookings($input: BookingsInquiry!) {
		getMyBookings(input: $input) {
			total
			list {
				_id
				bookingStatus
				bookingPreferredDate
				bookingConfirmedDate
				bookingAmount
				bookingCurrency
				clinic {
					clinicName
				}
				procedure {
					procedureName
				}
			}
		}
	}
`;

export interface BookingInput {
	bookingClinicId: string;
	bookingProcedureId: string;
	bookingPreferredDate: string; // ISO date string ("YYYY-MM-DD")
	bookingNote?: string;
}

interface CreateBookingData {
	createBooking: {
		_id: string;
		bookingStatus: string;
	};
}

interface CreateBookingVars {
	input: BookingInput;
}

export const CREATE_BOOKING: TypedDocumentNode<CreateBookingData, CreateBookingVars> = gql`
	mutation CreateBooking($input: BookingInput!) {
		createBooking(input: $input) {
			_id
			bookingStatus
		}
	}
`;
