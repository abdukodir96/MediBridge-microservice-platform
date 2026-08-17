import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import ChatRoomSchema from '../libs/schema/chat-room.model';
import MessageSchema from '../libs/schema/message.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ChatRoom', schema: ChatRoomSchema },
      { name: 'Message', schema: MessageSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
    // TCP client — talks to Core, to fetch memberLang when a room is
    // created (see ChatService.getMemberLang)
    ClientsModule.register([
      {
        name: 'CORE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CORE_TCP_HOST || 'localhost',
          port: Number(process.env.CORE_TCP_PORT) || 3002,
        },
      },
    ]),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
