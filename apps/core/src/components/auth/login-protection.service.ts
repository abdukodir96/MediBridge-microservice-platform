import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface LoginAttemptDocument {
	email: string;
	ipAddress: string;
	attempts: number;
	lockedUntil: Date | null;
}

// index = total attempts so far; value = lockout duration in seconds.
// Attempts 1-3 are unpunished (typos happen); it escalates from there.
const BACKOFF_SECONDS = [0, 0, 0, 30, 120, 480, 1800]; // 30s -> 2m -> 8m -> 30m (cap)

@Injectable()
export class LoginProtectionService {
	constructor(
		@InjectModel('LoginAttempt')
		private readonly attemptModel: Model<LoginAttemptDocument>,
	) {}

	public async assertNotLocked(email: string, ipAddress: string): Promise<void> {
		const record = await this.attemptModel.findOne({ email, ipAddress }).exec();
		if (record?.lockedUntil && record.lockedUntil > new Date()) {
			const secondsLeft = Math.ceil(
				(record.lockedUntil.getTime() - Date.now()) / 1000,
			);
			throw new HttpException(
				`Too many attempts. Try again in ${secondsLeft}s.`,
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}
	}

	public async recordFailure(email: string, ipAddress: string): Promise<void> {
		const record = await this.attemptModel
			.findOneAndUpdate(
				{ email, ipAddress },
				{ $inc: { attempts: 1 } },
				{ upsert: true, new: true },
			)
			.exec();

		const step = Math.min(record.attempts, BACKOFF_SECONDS.length - 1);
		const lockSeconds = BACKOFF_SECONDS[step];
		if (lockSeconds > 0) {
			await this.attemptModel
				.updateOne(
					{ email, ipAddress },
					{ lockedUntil: new Date(Date.now() + lockSeconds * 1000) },
				)
				.exec();
		}
	}

	public async recordSuccess(email: string, ipAddress: string): Promise<void> {
		// Correct password proves this is the real owner, not a brute-forcer —
		// clear the record even if it was mid-lockout.
		await this.attemptModel.deleteOne({ email, ipAddress }).exec();
	}
}
