import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../../components/auth/auth.service';

// Best-effort auth: if a valid bearer token is present, populates
// request.body.authMember (same shape AuthGuard/RolesGuard produce) so
// @AuthMember() can read it — but unlike those guards, a missing or invalid
// token is not an error. Use on queries that stay public but want to branch
// on "is this caller logged in, and who are they" (e.g. an owner viewing
// their own not-yet-verified resource).
@Injectable()
export class OptionalAuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const gqlContext = GqlExecutionContext.create(context);
		const request = gqlContext.getContext().req;

		const bearerToken = request.headers.authorization;
		if (!bearerToken) return true;

		const token = bearerToken.split(' ')[1];
		try {
			request.body.authMember = await this.authService.verifyToken(token);
		} catch {
			// invalid/expired token on an otherwise-public query — ignore it
		}
		return true;
	}
}
