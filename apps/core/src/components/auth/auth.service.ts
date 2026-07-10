import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus } from '../../libs/enums/member.enum';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	async createToken(member: Member): Promise<string> {
		const payload = {
			_id: member._id,
			memberType: member.memberType,
			memberNick: member.memberNick,
		};
		return await this.jwtService.signAsync(payload);
	}

	async verifyToken(token: string): Promise<Member> {
		const decoded = await this.jwtService.verifyAsync(token);

		// A 30-day token shouldn't outlive an account being blocked/deleted,
		// so re-check the member's current status against the DB every time.
		const member = await this.memberModel
			.findById(decoded._id, { memberStatus: 1 })
			.exec();
		if (!member || member.memberStatus !== MemberStatus.ACTIVE) {
			throw new UnauthorizedException('Account is no longer active');
		}

		return decoded;
	}
}
