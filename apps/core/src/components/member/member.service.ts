import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import {
	MemberInput,
	LoginInput,
	UpdateMemberEmailInput,
} from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { AuthService } from '../auth/auth.service';
import { comparePassword } from '../../libs/config';

// The GraphQL Member DTO deliberately omits memberPassword (never exposed to
// the client), but the raw Mongoose document still has it — this type
// restores it for internal use only (hashing/comparing on signup/login).
type MemberDocument = Member & { memberPassword: string };

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<MemberDocument>,
		private authService: AuthService,
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

	public async login(input: LoginInput): Promise<Member> {
		const { memberEmail, memberPassword } = input;

		// 1. Find by email — the schema excludes memberPassword by default
		// (select: false), so it has to be re-included explicitly. Using an
		// inclusion projection here (as before) would drop every other field
		// (memberEmail, memberPhone, timestamps, ...) that Member's GraphQL
		// type declares as non-nullable, breaking any query that asks for them.
		const member = await this.memberModel
			.findOne({ memberEmail: memberEmail })
			.select('+memberPassword')
			.exec();

		// Same generic message for "no such user" and "wrong password" —
		// distinguishing them lets an attacker enumerate registered emails.
		const invalidCredentials = () =>
			new BadRequestException('Invalid email or password');

		if (!member) {
			throw invalidCredentials();
		}
		if (member.memberStatus === MemberStatus.BLOCKED) {
			throw new BadRequestException('This account has been blocked');
		}
		if (member.memberStatus === MemberStatus.DELETED) {
			throw invalidCredentials();
		}

		// 2. Verify the password
		const isMatch = await comparePassword(memberPassword, member.memberPassword);
		if (!isMatch) {
			throw invalidCredentials();
		}

		// 3. Create the token — same toObject() + spread reasoning as signup()
		const accessToken = await this.authService.createToken(member);
		return { ...member.toObject(), accessToken } as Member;
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
}
