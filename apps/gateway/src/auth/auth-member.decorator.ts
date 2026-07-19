import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GatewayAuthMember } from './gateway-auth.guard';

export const AuthMember = createParamDecorator(
	(_data: unknown, context: ExecutionContext): GatewayAuthMember | undefined => {
		const gqlContext = GqlExecutionContext.create(context);
		return gqlContext.getContext().req.authMember;
	},
);
