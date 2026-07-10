import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

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
	],
	providers: [AuthService],
	exports: [AuthService], // so other modules can use it
})
export class AuthModule {}
