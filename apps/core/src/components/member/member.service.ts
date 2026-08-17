import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Member } from '../../libs/dto/member/member';
import {
	MemberInput,
	LoginInput,
	UpdateMemberEmailInput,
	UpdateProfileInput,
} from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { AuthService } from '../auth/auth.service';
import { LoginProtectionService } from '../auth/login-protection.service';
import { comparePassword, hashPassword } from '../../libs/config';

// The GraphQL Member DTO deliberately omits memberPassword (never exposed to
// the client), but the raw Mongoose document still has it — this type
// restores it for internal use only (hashing/comparing on signup/login).
type MemberDocument = Member & { memberPassword: string };

// Computed once at module load, not per-request — a nonexistent-email login
// must still pay for a bcrypt.compare() against *something*, or the missing
// hash step makes that path measurably faster than a wrong-password path on
// a real account, leaking which emails are registered via response timing.
const DUMMY_HASH = hashPassword('timing-safety-dummy-value');

// A plain BadRequestException's extra fields never reach the client — Apollo
// only serializes `extensions.code` + `originalError` (built from a *string*
// response, not an arbitrary object) for HttpExceptions. A GraphQLError is
// the documented way to put custom, client-readable data (requiresCaptcha)
// directly under `extensions`.
function captchaRequiredError(message: string): GraphQLError {
	return new GraphQLError(message, {
		extensions: { code: 'BAD_REQUEST', requiresCaptcha: true },
	});
}

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<MemberDocument>,
		private authService: AuthService,
		private loginProtection: LoginProtectionService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		// Defense in depth: ADMIN must never be reachable through signup, even
		// if the DTO's @IsIn allowlist were ever loosened by mistake later on.
		if (input.memberType === MemberType.ADMIN) {
			throw new BadRequestException('Cannot self-register as ADMIN');
		}

		try {
			// The schema's pre('save') hook hashes memberPassword automatically
			const result = await this.memberModel.create(input);

			const accessToken = await this.authService.createToken(result);

			// accessToken isn't a schema field, so setting it on the live
			// Mongoose document only survives in-process (GraphQL resolvers
			// read the object directly). Over TCP the response is
			// JSON-serialized via the document's toJSON(), which only
			// includes schema paths and would silently drop it — return a
			// plain object instead so it works over both transports.
			return { ...result.toObject(), accessToken } as Member;
		} catch (err) {
			const error = err as { message?: string; code?: number };
			console.log('Error, signup:', error.message);
			if (error.code === 11000) {
				throw new BadRequestException('This email is already registered');
			}
			throw new InternalServerErrorException('Signup failed');
		}
	}

	public async login(input: LoginInput, ipAddress: string): Promise<Member> {
		const { memberEmail, memberPassword, captchaToken } = input;

		await this.loginProtection.assertNotLocked(memberEmail, ipAddress);

		// Once this email+IP has racked up 3+ prior failures, a captcha is
		// required before we even look at the password — closes the gap where
		// an attacker could keep guessing right up to (but never past) the
		// lockout threshold, forever, without ever solving anything.
		const priorAttempts = await this.loginProtection.getAttemptCount(memberEmail, ipAddress);
		if (priorAttempts >= 3) {
			if (!captchaToken) {
				throw captchaRequiredError('Captcha verification required');
			}
			const captchaValid = await this.verifyCaptcha(captchaToken);
			if (!captchaValid) {
				throw captchaRequiredError('Captcha verification failed');
			}
		}

		// Find by email — the schema excludes memberPassword by default
		// (select: false), so it has to be re-included explicitly. Using an
		// inclusion projection here (as before) would drop every other field
		// (memberEmail, memberPhone, timestamps, ...) that Member's GraphQL
		// type declares as non-nullable, breaking any query that asks for them.
		const member = await this.memberModel
			.findOne({ memberEmail: memberEmail })
			.select('+memberPassword')
			.exec();

		// Always run a bcrypt.compare(), even for a nonexistent email — against
		// a fixed dummy hash if there's no real one — so this branch takes the
		// same time either way (see DUMMY_HASH above).
		const isMatch = member
			? await comparePassword(memberPassword, member.memberPassword)
			: await comparePassword(memberPassword, await DUMMY_HASH);

		if (!member || !isMatch) {
			await this.loginProtection.recordFailure(memberEmail, ipAddress);
			// Same message for "no such user" and "wrong password" — distinguishing
			// them lets an attacker enumerate registered emails.
			const attemptsNow = await this.loginProtection.getAttemptCount(memberEmail, ipAddress);
			if (attemptsNow >= 3) {
				throw captchaRequiredError('Invalid credentials');
			}
			throw new BadRequestException('Invalid credentials');
		}

		// Correct password — this is the real owner, not a brute-forcer.
		await this.loginProtection.recordSuccess(memberEmail, ipAddress);

		if (member.memberStatus === MemberStatus.BLOCKED) {
			throw new BadRequestException('This account has been blocked');
		}
		if (member.memberStatus === MemberStatus.DELETED) {
			throw new BadRequestException('Invalid credentials');
		}

		// Create the token — same toObject() + spread reasoning as signup()
		const accessToken = await this.authService.createToken(member);
		return { ...member.toObject(), accessToken } as Member;
	}

	private async verifyCaptcha(token: string): Promise<boolean> {
		const res = await fetch('https://hcaptcha.com/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				secret: process.env.HCAPTCHA_SECRET as string,
				response: token,
			}),
		});
		const data = (await res.json()) as { success: boolean };
		return data.success === true;
	}

	public async getMember(memberId: ObjectId): Promise<Member> {
		const member = await this.memberModel.findById(memberId).exec();
		if (!member) throw new NotFoundException('Member not found');
		return member;
	}

	public async updateEmail(
		memberId: ObjectId,
		input: UpdateMemberEmailInput,
	): Promise<Member> {
		const memberEmail = input.memberEmail.trim().toLowerCase();

		try {
			const member = await this.memberModel
				.findByIdAndUpdate(
					memberId,
					{ $set: { memberEmail } },
					{ new: true, runValidators: true },
				)
				.exec();

			if (!member) throw new NotFoundException('Member not found');
			return member;
		} catch (err) {
			if (err instanceof NotFoundException) throw err;

			const error = err as { code?: number };
			if (error.code === 11000) {
				throw new BadRequestException('This email is already registered');
			}

			throw new InternalServerErrorException('Email update failed');
		}
	}

	// Self-service profile edit — no ownership check needed, memberId always
	// comes from the caller's own token (see resolver), never an argument.
	public async updateProfile(
		memberId: ObjectId,
		input: UpdateProfileInput,
	): Promise<Member> {
		const result = await this.memberModel
			.findByIdAndUpdate(memberId, input, { new: true })
			.exec();
		if (!result) throw new NotFoundException('Member not found');
		return result;
	}
}
