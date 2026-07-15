import { registerEnumType } from '@nestjs/graphql';

export enum BookingStatus {
	REQUESTED = 'REQUESTED', // patient sent a request (initial state)
	CONFIRMED = 'CONFIRMED', // clinic confirmed
	PAID = 'PAID', // paid (later — Payment service)
	COMPLETED = 'COMPLETED', // procedure finished (later)
	CANCELLED = 'CANCELLED', // cancelled (final)
}
registerEnumType(BookingStatus, { name: 'BookingStatus' });
