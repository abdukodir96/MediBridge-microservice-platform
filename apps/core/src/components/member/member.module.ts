import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberResolver } from './member.resolver';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import MemberSchema from '../../libs/schema/member.model';
import LoginAttemptSchema from '../../libs/schema/login-attempt.model';
import { AuthModule } from '../auth/auth.module';
import { LoginProtectionService } from '../auth/login-protection.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Member', schema: MemberSchema },
			{ name: 'LoginAttempt', schema: LoginAttemptSchema },
		]),
		AuthModule,
	],
	controllers: [MemberController],
	providers: [MemberResolver, MemberService, LoginProtectionService],
	exports: [MemberService],
})
export class MemberModule {}
