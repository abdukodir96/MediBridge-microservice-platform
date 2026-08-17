import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

export type RoomKind = 'PATIENT_CLINIC' | 'ADMIN_CLINIC';

export interface ChatRoomDoc extends Document {
  roomPatientId: string | null;
  roomClinicOwnerId: string;
  roomAdminId: string | null;
  roomKind: RoomKind;
  roomBookingId: string | null;
  roomLastMessageAt: Date | null;
  roomPatientLang: string | null;
  roomClinicOwnerLang: string | null;
}

// Admin panel's assumed working language — ADMIN_CLINIC rooms don't freeze a
// per-admin language (it's a shared inbox, any admin can post), so an
// admin-authored message is always translated as if written in English.
const ADMIN_LANG = 'EN';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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
    @Inject('CORE_SERVICE') private readonly coreClient: ClientProxy,
  ) {}

  // Fetches a member's memberLang from Core, fail-open: if Core is
  // unreachable or the call errors, returns null rather than blocking room
  // creation — the room just won't get translation for that side (the same
  // "best-effort, never blocks the main flow" rule as message translation).
  private async getMemberLang(memberId: string): Promise<string | null> {
    try {
      const member = await firstValueFrom(
        this.coreClient
          .send<{ memberLang?: string }>(
            { cmd: 'member.getMyProfile' },
            memberId,
          )
          .pipe(
            timeout(5000),
            catchError(() => of(null)),
          ),
      );
      return member?.memberLang ?? null;
    } catch {
      return null;
    }
  }

  // Find or create a PATIENT_CLINIC room (upsert — race-safe: unique index +
  // $setOnInsert). Both participants' languages are fetched from Core once,
  // here, and frozen onto the room — see the schema comment for the
  // staleness trade-off.
  public async findOrCreateRoom(
    patientId: string,
    clinicOwnerId: string,
    bookingId?: string,
  ) {
    const existing = await this.roomModel
      .findOne({
        roomPatientId: patientId,
        roomClinicOwnerId: clinicOwnerId,
        roomKind: 'PATIENT_CLINIC',
      })
      .exec();
    if (existing) return existing;

    const [patientLang, clinicOwnerLang] = await Promise.all([
      this.getMemberLang(patientId),
      this.getMemberLang(clinicOwnerId),
    ]);

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
            roomPatientLang: patientLang,
            roomClinicOwnerLang: clinicOwnerLang,
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  // Find or create the ADMIN_CLINIC support room for a clinic — one shared
  // thread per clinic owner, regardless of which admin opens it or how many
  // admins exist. Only the clinic owner's language is fetched/frozen —
  // there's no single "the admin" to freeze a language for (see ADMIN_LANG).
  public async findOrCreateAdminRoom(adminId: string, clinicOwnerId: string) {
    const existing = await this.roomModel
      .findOne({ roomClinicOwnerId: clinicOwnerId, roomKind: 'ADMIN_CLINIC' })
      .exec();
    if (existing) return existing;

    const clinicOwnerLang = await this.getMemberLang(clinicOwnerId);

    return await this.roomModel
      .findOneAndUpdate(
        { roomClinicOwnerId: clinicOwnerId, roomKind: 'ADMIN_CLINIC' },
        {
          $setOnInsert: {
            roomClinicOwnerId: clinicOwnerId,
            roomAdminId: adminId, // history only — see assertRoomAccess
            roomKind: 'ADMIN_CLINIC',
            roomClinicOwnerLang: clinicOwnerLang,
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

  // Which language to translate a message INTO, and what language it's
  // assumed to be written IN, based on who sent it and the room's frozen
  // participant languages. Returns null when translation isn't needed:
  // missing language data (Core was unreachable when the room was opened),
  // or source and target happen to be the same language already.
  private resolveTranslation(
    room: ChatRoomDoc,
    senderId: string,
  ): { sourceLang: string; targetLang: string } | null {
    let sourceLang: string | null;
    let targetLang: string | null;

    if (room.roomKind === 'ADMIN_CLINIC') {
      if (senderId === room.roomClinicOwnerId) {
        sourceLang = room.roomClinicOwnerLang;
        targetLang = ADMIN_LANG;
      } else {
        sourceLang = ADMIN_LANG;
        targetLang = room.roomClinicOwnerLang;
      }
    } else if (senderId === room.roomPatientId) {
      sourceLang = room.roomPatientLang;
      targetLang = room.roomClinicOwnerLang;
    } else {
      sourceLang = room.roomClinicOwnerLang;
      targetLang = room.roomPatientLang;
    }

    if (!sourceLang || !targetLang || sourceLang === targetLang) return null;
    return { sourceLang, targetLang };
  }

  // Best-effort, fire-and-forget from the caller's perspective: calls the AI
  // service and patches the message with its translation. Every failure
  // mode (missing language data, AI service down/unconfigured, network
  // error, bad response) resolves to `null` rather than throwing — a
  // message is already sent and visible before this ever runs, so nothing
  // here is allowed to be on the critical path.
  public async translateMessage(
    room: ChatRoomDoc,
    message: MessageDoc,
  ): Promise<MessageDoc | null> {
    const resolved = this.resolveTranslation(room, message.messageSenderId);
    if (!resolved) return null;

    try {
      const res = await fetch(`${AI_SERVICE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.messageText,
          targetLang: resolved.targetLang,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return null;

      const data = (await res.json()) as { translatedText?: string };
      if (!data.translatedText) return null;

      return await this.messageModel
        .findByIdAndUpdate(
          message._id,
          {
            messageTranslatedText: data.translatedText,
            messageLang: resolved.sourceLang,
          },
          { new: true },
        )
        .exec();
    } catch {
      return null;
    }
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
