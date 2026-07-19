import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MemberService } from './member.service';
import { Member } from '../../libs/dto/member/member';
import {
	MemberInput,
	LoginInput,
	UpdateMemberEmailInput,
} from '../../libs/dto/member/member.input';
import { AuthService } from '../auth/auth.service';

@Controller()
export class MemberController {
	constructor(
		private readonly memberService: MemberService,
		private readonly authService: AuthService,
	) {}

	// TCP: signup message from the Gateway
	@MessagePattern({ cmd: 'member.signup' })
	public async signup(@Payload() input: MemberInput): Promise<Member> {
		console.log('TCP: member.signup');
		return await this.memberService.signup(input);
	}

	// TCP: login message from the Gateway
	@MessagePattern({ cmd: 'member.login' })
	public async login(@Payload() input: LoginInput): Promise<Member> {
		console.log('TCP: member.login');
		return await this.memberService.login(input);
	}

	@MessagePattern({ cmd: 'member.authenticate' })
	public async authenticate(@Payload() token: string): Promise<Member> {
		return await this.authService.verifyToken(token);
	}

	@MessagePattern({ cmd: 'member.getMyProfile' })
	public async getMyProfile(
		@Payload() memberId: Member['_id'],
	): Promise<Member> {
		return await this.memberService.getMember(memberId);
	}

	@MessagePattern({ cmd: 'member.updateMyEmail' })
	public async updateMyEmail(
		@Payload()
		payload: { memberId: Member['_id']; input: UpdateMemberEmailInput },
	): Promise<Member> {
		return await this.memberService.updateEmail(
			payload.memberId,
			payload.input,
		);
	}
}
