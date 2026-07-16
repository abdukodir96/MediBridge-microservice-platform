import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
	constructor(
		@InjectModel('ChatRoom') private readonly roomModel: Model<any>,
		@InjectModel('Message') private readonly messageModel: Model<any>,
	) {}

	// Find or create a room (upsert — race-safe: unique index + $setOnInsert)
	public async findOrCreateRoom(
		patientId: string,
		clinicOwnerId: string,
		bookingId?: string,
	) {
		return await this.roomModel
			.findOneAndUpdate(
				{ roomPatientId: patientId, roomClinicOwnerId: clinicOwnerId },
				{
					$setOnInsert: {
						roomPatientId: patientId,
						roomClinicOwnerId: clinicOwnerId,
						roomBookingId: bookingId ?? null,
					},
				},
				{ upsert: true, new: true },
			)
			.exec();
	}

	// Is this member part of the room? (patient side or clinic owner side)
	public async assertRoomAccess(roomId: string, memberId: string) {
		const room = await this.roomModel.findById(roomId).exec();
		if (!room) throw new NotFoundException('Room not found');

		const isMember =
			room.roomPatientId === memberId || room.roomClinicOwnerId === memberId;
		if (!isMember) {
			throw new ForbiddenException('You are not a member of this room');
		}
		return room;
	}

	// Save a message + bump the room's lastMessageAt
	public async saveMessage(roomId: string, senderId: string, text: string) {
		const message = await this.messageModel.create({
			messageRoomId: roomId,
			messageSenderId: senderId,
			messageText: text,
		});

		await this.roomModel
			.findByIdAndUpdate(roomId, { roomLastMessageAt: new Date() })
			.exec();

		return message;
	}

	// Room history (last N messages)
	public async getRoomMessages(roomId: string, limit = 50) {
		return await this.messageModel
			.find({ messageRoomId: roomId })
			.sort({ createdAt: -1 })
			.limit(Math.min(limit, 100)) // cap, same @Max pattern as Core
			.exec();
	}

	// A member's rooms (as patient or as clinic owner)
	public async getMyRooms(memberId: string) {
		return await this.roomModel
			.find({
				$or: [{ roomPatientId: memberId }, { roomClinicOwnerId: memberId }],
			})
			.sort({ roomLastMessageAt: -1 })
			.exec();
	}
}
