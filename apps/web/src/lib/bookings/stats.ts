import type { BookingStatus, MyBooking } from "@/lib/graphql/bookings";
import type { ClinicBooking } from "@/lib/graphql/clinic-bookings";

export interface PatientBookingStats {
	active: number;
	inEscrow: number;
	completed: number;
	cancelled: number;
}

const ACTIVE_STATUSES: BookingStatus[] = ["REQUESTED", "CONFIRMED", "PAID"];

export function computePatientStats(bookings: MyBooking[]): PatientBookingStats {
	return bookings.reduce<PatientBookingStats>(
		(acc, booking) => {
			if (ACTIVE_STATUSES.includes(booking.bookingStatus)) acc.active++;
			if (booking.bookingStatus === "PAID" && booking.bookingAmount) {
				acc.inEscrow += booking.bookingAmount;
			}
			if (booking.bookingStatus === "COMPLETED") acc.completed++;
			if (booking.bookingStatus === "CANCELLED") acc.cancelled++;
			return acc;
		},
		{ active: 0, inEscrow: 0, completed: 0, cancelled: 0 },
	);
}

export interface ClinicBookingStats {
	newRequests: number;
	activeBookings: number;
	earnings: number;
}

const CLINIC_ACTIVE_STATUSES: BookingStatus[] = ["CONFIRMED", "PAID"];
const CLINIC_EARNING_STATUSES: BookingStatus[] = ["PAID", "COMPLETED"];

export function computeClinicStats(bookings: ClinicBooking[]): ClinicBookingStats {
	return bookings.reduce<ClinicBookingStats>(
		(acc, booking) => {
			if (booking.bookingStatus === "REQUESTED") acc.newRequests++;
			if (CLINIC_ACTIVE_STATUSES.includes(booking.bookingStatus)) acc.activeBookings++;
			if (CLINIC_EARNING_STATUSES.includes(booking.bookingStatus) && booking.bookingAmount) {
				acc.earnings += booking.bookingAmount;
			}
			return acc;
		},
		{ newRequests: 0, activeBookings: 0, earnings: 0 },
	);
}
