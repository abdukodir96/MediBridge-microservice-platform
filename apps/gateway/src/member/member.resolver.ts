import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
	Member,
	MemberInput,
	LoginInput,
	UpdateMemberEmailInput,
} from './dto/member.dto';
import {
	GatewayAuthGuard,
	type GatewayAuthMember,
} from '../auth/gateway-auth.guard';
import { AuthMember } from '../auth/auth-member.decorator';

// The TCP transport JSON-serializes the RPC response, which turns Date
// fields into ISO strings — but the GraphQL DateTime scalar's serialize()
// requires an actual Date instance (a string makes it return null and trip
// the non-nullable field check). Parse them back before returning.
const toMember = (raw: any): Member => ({
	...raw,
	createdAt: new Date(raw.createdAt),
	updatedAt: new Date(raw.updatedAt),
});

@Resolver()
export class MemberResolver {
	constructor(
		@Inject('CORE_SERVICE') private readonly coreClient: ClientProxy,
	) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Gateway: signup → TCP → Core');
		const result = await firstValueFrom(
			this.coreClient.send({ cmd: 'member.signup' }, input),
		);
		return toMember(result);
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Gateway: login → TCP → Core');
		const result = await firstValueFrom(
			this.coreClient.send({ cmd: 'member.login' }, input),
		);
		return toMember(result);
	}

	@Query(() => Member)
	@UseGuards(GatewayAuthGuard)
	public async getMyProfile(
		@AuthMember() authMember: GatewayAuthMember,
	): Promise<Member> {
		const result = await firstValueFrom(
			this.coreClient.send(
				{ cmd: 'member.getMyProfile' },
				authMember._id,
			),
		);
		return toMember(result);
	}

	@Mutation(() => Member)
	@UseGuards(GatewayAuthGuard)
	public async updateMyEmail(
		@AuthMember() authMember: GatewayAuthMember,
		@Args('input') input: UpdateMemberEmailInput,
	): Promise<Member> {
		const result = await firstValueFrom(
			this.coreClient.send(
				{ cmd: 'member.updateMyEmail' },
				{ memberId: authMember._id, input },
			),
		);
		return toMember(result);
	}

	// GraphQL requires at least one Query
	@Query(() => String)
	public healthCheck(): string {
		return 'Gateway OK';
	}
}
