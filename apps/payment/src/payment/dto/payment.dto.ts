import {
	IsNotEmpty,
	IsOptional,
	IsNumber,
	IsString,
	Min,
} from 'class-validator';

// TCP "create payment" request
export class CreatePaymentDto {
	@IsNotEmpty()
	@IsString()
	bookingId: string;

	@IsNotEmpty()
	@IsString()
	patientId: string;

	@IsNotEmpty()
	@IsString()
	clinicId: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(0.01)
	amount: number;

	@IsOptional()
	@IsString()
	currency?: string;

	// Idempotency: the caller (Gateway/Core) sends a unique key per payment
	// attempt. A retry carries the same key.
	@IsNotEmpty()
	@IsString()
	idempotencyKey: string;
}

// release / refund requests
export class PaymentActionDto {
	@IsNotEmpty()
	@IsString()
	paymentId: string;
}
