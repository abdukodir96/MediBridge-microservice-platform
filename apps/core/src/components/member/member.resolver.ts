import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member } from '../../libs/dto/member/member';
import { MemberInput, LoginInput } from '../../libs/dto/member/member.input';
import { AuthGuard } from '../../libs/auth/guards/auth.guard';
import { AuthMember } from '../../libs/auth/decorators/auth-member.decorator';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Mutation: signup');
		return await this.memberService.signup(input);
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation: login');
		return await this.memberService.login(input);
	}

	@Query(() => Member)
	@UseGuards(AuthGuard)
	public async getMyProfile(@AuthMember() authMember: Member): Promise<Member> {
		console.log('Query: getMyProfile');
		return await this.memberService.getMember(authMember._id);
	}
}
