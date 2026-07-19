import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export type GatewayAuthMember = {
	_id: string;
	memberType: string;
	memberNick: string;
};

type AuthenticatedRequest = {
	headers: { authorization?: string };
	authMember?: GatewayAuthMember;
};

@Injectable()
export class GatewayAuthGuard implements CanActivate {
	constructor(
		@Inject('CORE_SERVICE') private readonly coreClient: ClientProxy,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const gqlContext = GqlExecutionContext.create(context);
		const request = gqlContext.getContext<{ req: AuthenticatedRequest }>().req;
		const authorization = request.headers.authorization;
		const match = authorization?.match(/^Bearer\s+(.+)$/i);

		if (!match?.[1]) {
			throw new UnauthorizedException('Please log in first');
		}

		try {
			request.authMember = await firstValueFrom(
				this.coreClient.send<GatewayAuthMember>(
					{ cmd: 'member.authenticate' },
					match[1],
				),
			);
			return true;
		} catch {
			throw new UnauthorizedException('Invalid or expired token');
		}
	}
}
