import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MemberService } from './member.service';
import { Member } from '../../libs/dto/member/member';
import { MemberInput, LoginInput } from '../../libs/dto/member/member.input';

@Controller()
export class MemberController {
	constructor(private readonly memberService: MemberService) {}

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
}
