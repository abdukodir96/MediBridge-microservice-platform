import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export type RoomKind = 'PATIENT_CLINIC' | 'ADMIN_CLINIC';

export interface ChatRoomDoc extends Document {
  roomPatientId: string | null;
  roomClinicOwnerId: string;
  roomAdminId: string | null;
  roomKind: RoomKind;
  roomBookingId: string | null;
  roomLastMessageAt: Date | null;
}

export interface MessageDoc extends Document {
  messageRoomId: string;
  messageSenderId: string;
  messageText: string;
  messageTranslatedText: string | null;
  messageLang: string | null;
  messageRead: boolean;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('ChatRoom') private readonly roomModel: Model<ChatRoomDoc>,
    @InjectModel('Message') private readonly messageModel: Model<MessageDoc>,
  ) {}

  // Find or create a PATIENT_CLINIC room (upsert — race-safe: unique index +
  // $setOnInsert)
  public async findOrCreateRoom(
    patientId: string,
    clinicOwnerId: string,
    bookingId?: string,
  ) {
    return await this.roomModel
      .findOneAndUpdate(
        {
          roomPatientId: patientId,
          roomClinicOwnerId: clinicOwnerId,
          roomKind: 'PATIENT_CLINIC',
        },
        {
          $setOnInsert: {
            roomPatientId: patientId,
            roomClinicOwnerId: clinicOwnerId,
            roomKind: 'PATIENT_CLINIC',
            roomBookingId: bookingId ?? null,
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  // Find or create the ADMIN_CLINIC support room for a clinic — one shared
  // thread per clinic owner, regardless of which admin opens it or how many
  // admins exist.
  public async findOrCreateAdminRoom(adminId: string, clinicOwnerId: string) {
    return await this.roomModel
      .findOneAndUpdate(
        { roomClinicOwnerId: clinicOwnerId, roomKind: 'ADMIN_CLINIC' },
        {
          $setOnInsert: {
            roomClinicOwnerId: clinicOwnerId,
            roomAdminId: adminId, // history only — see assertRoomAccess
            roomKind: 'ADMIN_CLINIC',
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  // Is this member allowed into the room? Branches on roomKind: an
  // ADMIN_CLINIC room is readable/writable by ANY admin (shared inbox) plus
  // the clinic owner it belongs to; a PATIENT_CLINIC room is unchanged —
  // only its own two participants.
  public async assertRoomAccess(
    roomId: string,
    memberId: string,
    memberType: string,
  ) {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Room not found');

    if (room.roomKind === 'ADMIN_CLINIC') {
      const isAllowed =
        memberType === 'ADMIN' || room.roomClinicOwnerId === memberId;
      if (!isAllowed) {
        throw new ForbiddenException('You are not allowed in this room');
      }
      return room;
    }

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

  // A member's rooms — branches by role:
  // - ADMIN: every ADMIN_CLINIC room (shared support inbox)
  // - CLINIC: its own patient rooms AND its own admin-support room
  // - PATIENT: only its own patient rooms
  public async getMyRooms(memberId: string, memberType: string) {
    if (memberType === 'ADMIN') {
      return await this.roomModel
        .find({ roomKind: 'ADMIN_CLINIC' })
        .sort({ roomLastMessageAt: -1 })
        .exec();
    }

    if (memberType === 'CLINIC') {
      return await this.roomModel
        .find({
          $or: [
            { roomKind: 'PATIENT_CLINIC', roomClinicOwnerId: memberId },
            { roomKind: 'ADMIN_CLINIC', roomClinicOwnerId: memberId },
          ],
        })
        .sort({ roomLastMessageAt: -1 })
        .exec();
    }

    return await this.roomModel
      .find({ roomKind: 'PATIENT_CLINIC', roomPatientId: memberId })
      .sort({ roomLastMessageAt: -1 })
      .exec();
  }
}
