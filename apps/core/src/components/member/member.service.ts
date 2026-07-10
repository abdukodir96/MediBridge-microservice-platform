import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { MemberInput, LoginInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
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
		try {
			// The schema's pre('save') hook hashes memberPassword automatically
			const result = await this.memberModel.create(input);

			result.accessToken = await this.authService.createToken(result);
			return result;
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

		// 1. Find by email — also fetch the password
		const member = await this.memberModel
			.findOne(
				{ memberEmail: memberEmail },
				{ memberPassword: 1, memberStatus: 1, memberType: 1, memberNick: 1 },
			)
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

		// 3. Create the token
		member.accessToken = await this.authService.createToken(member);
		return member;
	}

	public async getMember(memberId: ObjectId): Promise<Member> {
		const member = await this.memberModel.findById(memberId).exec();
		if (!member) throw new NotFoundException('Member not found');
		return member;
	}
}
