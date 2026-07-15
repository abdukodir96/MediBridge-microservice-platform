import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

// ThrottlerGuard reads the request off the HTTP execution context by default,
// which is empty for GraphQL resolvers — pull it from the GQL context instead.
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	protected getRequestResponse(context: ExecutionContext) {
		const gqlContext = GqlExecutionContext.create(context);
		const ctx = gqlContext.getContext();
		return { req: ctx.req, res: ctx.req.res };
	}
}
