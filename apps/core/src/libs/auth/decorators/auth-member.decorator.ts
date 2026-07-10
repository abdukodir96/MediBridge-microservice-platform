import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthMember = createParamDecorator(
	(data: string, context: ExecutionContext) => {
		const gqlContext = GqlExecutionContext.create(context);
		const authMember = gqlContext.getContext().req.body.authMember;

		return data ? authMember?.[data] : authMember;
	},
);
