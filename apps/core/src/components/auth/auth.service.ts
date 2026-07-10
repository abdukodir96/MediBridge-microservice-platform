import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}

	async createToken(member: Member): Promise<string> {
		const payload = {
			_id: member._id,
			memberType: member.memberType,
			memberNick: member.memberNick,
		};
		return await this.jwtService.signAsync(payload);
	}

	async verifyToken(token: string): Promise<Member> {
		return await this.jwtService.verifyAsync(token);
	}
}
