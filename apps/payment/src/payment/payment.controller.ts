import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, PaymentActionDto } from './dto/payment.dto';

@Controller()
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@MessagePattern({ cmd: 'payment.create' })
	public async createPayment(@Payload() dto: CreatePaymentDto) {
		console.log('TCP: payment.create');
		return await this.paymentService.createPayment(dto);
	}

	@MessagePattern({ cmd: 'payment.release' })
	public async releasePayment(@Payload() dto: PaymentActionDto) {
		console.log('TCP: payment.release');
		return await this.paymentService.releasePayment(dto.paymentId);
	}

	@MessagePattern({ cmd: 'payment.refund' })
	public async refundPayment(@Payload() dto: PaymentActionDto) {
		console.log('TCP: payment.refund');
		return await this.paymentService.refundPayment(dto.paymentId);
	}

	@MessagePattern({ cmd: 'payment.get' })
	public async getPayment(@Payload() dto: PaymentActionDto) {
		console.log('TCP: payment.get');
		return await this.paymentService.getPayment(dto.paymentId);
	}

	@MessagePattern({ cmd: 'payment.getByBooking' })
	public async getPaymentByBooking(@Payload() dto: { bookingId: string }) {
		console.log('TCP: payment.getByBooking');
		return await this.paymentService.getPaymentByBooking(dto.bookingId);
	}
}
