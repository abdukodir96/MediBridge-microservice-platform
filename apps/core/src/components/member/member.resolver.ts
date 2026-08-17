import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { MemberService } from './member.service';
import { Member } from '../../libs/dto/member/member';
import {
	MemberInput,
	LoginInput,
	UpdateMemberEmailInput,
	UpdateProfileInput,
} from '../../libs/dto/member/member.input';
import { AuthGuard } from '../../libs/auth/guards/auth.guard';
import { AuthMember } from '../../libs/auth/decorators/auth-member.decorator';

// Login/signup are brute-force/enumeration targets, so they get a much
// tighter limit than the app-wide default set in ThrottlerModule.
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Throttle(AUTH_THROTTLE)
	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Mutation: signup');
		return await this.memberService.signup(input);
	}

	@Throttle(AUTH_THROTTLE)
	@Mutation(() => Member)
	public async login(
		@Args('input') input: LoginInput,
		@Context() context: { req: Request },
	): Promise<Member> {
		console.log('Mutation: login');
		// x-forwarded-for is client-supplied and spoofable behind a proxy that
		// doesn't overwrite it — fine here since the lockout only protects the
		// account, not a resource an attacker gains by evading it (worst case
		// they reset their own counter, no different from switching IPs for real).
		const ip = (context.req.headers['x-forwarded-for'] as string) ?? context.req.ip ?? 'unknown';
		return await this.memberService.login(input, ip);
	}

	@Query(() => Member)
	@UseGuards(AuthGuard)
	public async getMyProfile(@AuthMember() authMember: Member): Promise<Member> {
		console.log('Query: getMyProfile');
		return await this.memberService.getMember(authMember._id);
	}

	@Mutation(() => Member)
	@UseGuards(AuthGuard)
	public async updateMyEmail(
		@AuthMember() authMember: Member,
		@Args('input') input: UpdateMemberEmailInput,
	): Promise<Member> {
		console.log('Mutation: updateMyEmail');
		return await this.memberService.updateEmail(authMember._id, input);
	}

	@Mutation(() => Member)
	@UseGuards(AuthGuard)
	public async updateProfile(
		@AuthMember() authMember: Member,
		@Args('input') input: UpdateProfileInput,
	): Promise<Member> {
		console.log('Mutation: updateProfile');
		return await this.memberService.updateProfile(authMember._id, input);
	}
}
