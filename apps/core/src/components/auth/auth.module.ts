import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import MemberSchema from '../../libs/schema/member.model';

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '30d' }, // token is valid for 30 days
			}),
		}),
		// Needed so AuthService can re-check the member's current status on every
		// token verification (a 30-day token shouldn't outlive a block/delete)
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	providers: [AuthService],
	exports: [AuthService], // so other modules can use it
})
export class AuthModule {}
