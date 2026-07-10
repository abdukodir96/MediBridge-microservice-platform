import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../../components/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Get the GraphQL context
		const gqlContext = GqlExecutionContext.create(context);
		const request = gqlContext.getContext().req;

		// Token from the Authorization header
		const bearerToken = request.headers.authorization;
		if (!bearerToken) {
			throw new UnauthorizedException('No token provided — please log in first');
		}

		const token = bearerToken.split(' ')[1]; // "Bearer xxx" → "xxx"

		try {
			const authMember = await this.authService.verifyToken(token);
			request.body.authMember = authMember;
			return true;
		} catch (err) {
			throw new UnauthorizedException('Invalid or expired token');
		}
	}
}
