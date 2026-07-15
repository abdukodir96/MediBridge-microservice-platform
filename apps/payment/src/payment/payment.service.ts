import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaymentStatus, TxType, Prisma } from '@prisma/client';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class PaymentService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Creates a payment and places it in escrow (PENDING → HELD).
	 * Idempotent: a repeat of the same idempotencyKey returns the existing
	 * payment instead of creating a new one.
	 */
	public async createPayment(dto: CreatePaymentDto) {
		// 1. IDEMPOTENCY: does a payment with this key already exist?
		const existing = await this.prisma.payment.findUnique({
			where: { idempotencyKey: dto.idempotencyKey },
		});
		if (existing) {
			// A retry, not an error — return the existing result.
			console.log('Idempotent replay:', dto.idempotencyKey);
			return existing;
		}

		try {
			// 2. ATOMIC: Payment creation + CHARGE log — both or neither.
			return await this.prisma.$transaction(async (tx) => {
				const payment = await tx.payment.create({
					data: {
						bookingId: dto.bookingId,
						patientId: dto.patientId,
						clinicId: dto.clinicId,
						amount: dto.amount,
						currency: dto.currency ?? 'USD',
						idempotencyKey: dto.idempotencyKey,
						status: PaymentStatus.HELD, // taken into escrow
					},
				});

				await tx.transaction.create({
					data: {
						type: TxType.CHARGE,
						amount: dto.amount,
						paymentId: payment.id,
					},
				});

				return payment;
			});
		} catch (err) {
			// The findUnique check above has a race window: two concurrent
			// requests with the same idempotencyKey can both pass it and both
			// reach create(). The DB's @unique constraint stops the second one
			// — treat that as a successful idempotent replay, not a crash.
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === UNIQUE_CONSTRAINT_VIOLATION
			) {
				const winner = await this.prisma.payment.findUnique({
					where: { idempotencyKey: dto.idempotencyKey },
				});
				if (winner) return winner;
			}
			throw err;
		}
	}

	/**
	 * Releases funds from escrow to the clinic (HELD → RELEASED).
	 * Race-safe: the status condition lives in the UPDATE itself (atomic).
	 */
	public async releasePayment(paymentId: string) {
		return await this.prisma.$transaction(async (tx) => {
			// updateMany with a status condition in WHERE — the same atomic
			// pattern used for Booking's state machine, now in Prisma.
			const updated = await tx.payment.updateMany({
				where: { id: paymentId, status: PaymentStatus.HELD },
				data: { status: PaymentStatus.RELEASED },
			});

			if (updated.count === 0) {
				// Either not found, or not HELD anymore — figure out which.
				const payment = await tx.payment.findUnique({
					where: { id: paymentId },
				});
				if (!payment) throw new NotFoundException('Payment not found');
				throw new BadRequestException(
					'Payment is not in a releasable state',
				);
			}

			const payment = await tx.payment.findUnique({
				where: { id: paymentId },
			});

			await tx.transaction.create({
				data: {
					type: TxType.RELEASE,
					amount: payment!.amount,
					paymentId: payment!.id,
				},
			});

			return payment;
		});
	}

	/**
	 * Returns funds from escrow to the patient (HELD → REFUNDED).
	 */
	public async refundPayment(paymentId: string) {
		return await this.prisma.$transaction(async (tx) => {
			const updated = await tx.payment.updateMany({
				where: { id: paymentId, status: PaymentStatus.HELD },
				data: { status: PaymentStatus.REFUNDED },
			});

			if (updated.count === 0) {
				const payment = await tx.payment.findUnique({
					where: { id: paymentId },
				});
				if (!payment) throw new NotFoundException('Payment not found');
				throw new BadRequestException(
					'Payment is not in a refundable state',
				);
			}

			const payment = await tx.payment.findUnique({
				where: { id: paymentId },
			});

			await tx.transaction.create({
				data: {
					type: TxType.REFUND,
					amount: payment!.amount,
					paymentId: payment!.id,
				},
			});

			return payment;
		});
	}

	// A single payment, with its Transaction history
	public async getPayment(paymentId: string) {
		const payment = await this.prisma.payment.findUnique({
			where: { id: paymentId },
			include: { transactions: true }, // Prisma does the JOIN
		});
		if (!payment) throw new NotFoundException('Payment not found');
		return payment;
	}

	// The payment for a booking (Core asks for this)
	public async getPaymentByBooking(bookingId: string) {
		return await this.prisma.payment.findFirst({
			where: { bookingId },
			include: { transactions: true },
			orderBy: { createdAt: 'desc' },
		});
	}
}
