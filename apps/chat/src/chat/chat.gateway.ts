import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
	cors: { origin: '*' }, // dev only; use an explicit origin in production
})
export class ChatGateway implements OnGatewayConnection {
	@WebSocketServer()
	server!: Server;

	constructor(
		private readonly jwtService: JwtService,
		private readonly chatService: ChatService,
	) {}

	// HANDSHAKE AUTH: the token is verified once, at connect time
	async handleConnection(client: Socket) {
		try {
			const token = client.handshake.auth?.token as string;
			if (!token) throw new Error('No token');

			const payload = await this.jwtService.verifyAsync(token);
			// Attach the member's identity to the socket
			client.data.memberId = String(payload._id);
			client.data.memberType = payload.memberType;
			console.log(`WS connected: ${client.data.memberId}`);
		} catch (err) {
			console.log('WS auth failed, disconnecting');
			client.disconnect(); // invalid token — connection refused
		}
	}

	// Join a room (a socket.io room — used for real-time delivery)
	@SubscribeMessage('joinRoom')
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string },
	) {
		// ACCESS: is this member part of the room? ChatService throws
		// NotFound/Forbidden (HTTP exceptions) — those aren't WsException, so
		// NestJS's default WS filter would turn them into "Internal server
		// error" and send it on a separate "exception" event (the ack would
		// never fire). Catch here instead and return the real message via ack.
		try {
			await this.chatService.assertRoomAccess(data.roomId, client.data.memberId);
		} catch (err) {
			return { status: 'error', message: (err as Error).message };
		}

		client.join(data.roomId); // joined the socket.io room
		const messages = await this.chatService.getRoomMessages(data.roomId);
		// NOTE: the returned object must NOT have an "event" key — the NestJS
		// socket.io adapter treats a {event, data} shaped response as the
		// WsResponse pattern and does socket.emit(response.event, response.data)
		// instead of calling the ack (bindMessageHandlers, io-adapter.js).
		// Using "status" here avoids that collision.
		return { status: 'roomJoined', messages: messages.reverse() }; // oldest → newest
	}

	// Send a message
	@SubscribeMessage('sendMessage')
	async handleSendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string; text: string },
	) {
		if (!data.text?.trim() || data.text.length > 2000) {
			return { status: 'error', message: 'Invalid message text' };
		}

		try {
			await this.chatService.assertRoomAccess(data.roomId, client.data.memberId);
		} catch (err) {
			return { status: 'error', message: (err as Error).message };
		}

		const message = await this.chatService.saveMessage(
			data.roomId,
			client.data.memberId,
			data.text.trim(),
		);

		// REAL-TIME: broadcast to everyone in the room (including the sender,
		// as a delivery confirmation)
		this.server.to(data.roomId).emit('newMessage', message);

		return { status: 'sent', messageId: String(message._id) };
	}

	// Open/find a room (a patient wants to talk to a clinic owner)
	@SubscribeMessage('openRoom')
	async handleOpenRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { patientId: string; clinicOwnerId: string; bookingId?: string },
	) {
		// Can only open a room the caller is actually part of
		const me = client.data.memberId;
		if (me !== data.patientId && me !== data.clinicOwnerId) {
			return { status: 'error', message: 'You must be a participant' };
		}

		const room = await this.chatService.findOrCreateRoom(
			data.patientId,
			data.clinicOwnerId,
			data.bookingId,
		);
		return { status: 'roomOpened', roomId: String(room._id) };
	}

	// A member's room list (as patient or as clinic owner)
	@SubscribeMessage('getMyRooms')
	async handleGetMyRooms(@ConnectedSocket() client: Socket) {
		try {
			const rooms = await this.chatService.getMyRooms(client.data.memberId);
			return { status: 'ok', rooms };
		} catch (err) {
			return { status: 'error', message: (err as { message?: string }).message };
		}
	}
}
