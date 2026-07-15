import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

// ThrottlerGuard reads the request off the HTTP execution context by default,
// which is empty for GraphQL resolvers — pull it from the GQL context instead.
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// This guard is registered globally (APP_GUARD) and, because the app is
		// hybrid (HTTP + TCP microservice with inheritAppConfig), it also runs
		// for RPC message-pattern handlers — which have no HTTP req/res to rate
		// limit by IP. Per-IP throttling only makes sense at the public
		// GraphQL/HTTP edge, so skip it for internal TCP calls.
		if (context.getType() === 'rpc') {
			return true;
		}
		return super.canActivate(context);
	}

	protected getRequestResponse(context: ExecutionContext) {
		const gqlContext = GqlExecutionContext.create(context);
		const ctx = gqlContext.getContext();
		return { req: ctx.req, res: ctx.req.res };
	}
}
