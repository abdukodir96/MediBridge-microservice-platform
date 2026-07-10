import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import MemberSchema from '../../libs/schema/member.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
		AuthModule,
	],
	providers: [MemberResolver, MemberService],
	exports: [MemberService],
})
export class MemberModule {}
