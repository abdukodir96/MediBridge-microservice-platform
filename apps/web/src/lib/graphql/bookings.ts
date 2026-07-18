import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

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
