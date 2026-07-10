import {
	CanActivate,
	ExecutionContext,
	Injectable,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../../components/auth/auth.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { MemberType } from '../../enums/member.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<MemberType[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (!requiredRoles) return true;

		const gqlContext = GqlExecutionContext.create(context);
		const request = gqlContext.getContext().req;

		const bearerToken = request.headers.authorization;
		if (!bearerToken) {
			throw new UnauthorizedException('No token provided');
		}
		const token = bearerToken.split(' ')[1];

		let authMember;
		try {
			authMember = await this.authService.verifyToken(token);
		} catch (err) {
			throw new UnauthorizedException('Invalid token');
		}
		request.body.authMember = authMember;

		const hasRole = requiredRoles.includes(authMember.memberType);
		if (!hasRole) {
			throw new ForbiddenException(
				`Access denied — this action is restricted to ${requiredRoles.join(', ')}`,
			);
		}
		return true;
	}
}
