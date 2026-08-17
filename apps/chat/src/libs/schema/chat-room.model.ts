import { Schema } from 'mongoose';

const ChatRoomSchema = new Schema(
  {
    roomPatientId: {
      type: String, // Core's Member ObjectId — cross-service, hence String
      default: null, // optional now — absent on ADMIN_CLINIC rooms
    },
    roomClinicOwnerId: {
      type: String, // Core's clinic owner Member ObjectId (not the Clinic ID —
      // stored this way so access checks don't need a round trip to Core)
      required: true, // required on both room kinds
    },
    roomAdminId: {
      type: String,
      default: null, // only set on ADMIN_CLINIC rooms — the admin who opened
      // it, kept for history only, NOT the source of access control (any
      // ADMIN can read/write an ADMIN_CLINIC room, see assertRoomAccess)
    },
    roomKind: {
      type: String,
      enum: ['PATIENT_CLINIC', 'ADMIN_CLINIC'],
      required: true,
    },
    roomBookingId: {
      type: String,
      default: null,
    },
    // Denormalized from Core's Member.memberLang at room-creation time (not
    // live-queried per message) — a deliberate staleness-for-simplicity
    // trade-off: if a member changes their language later, rooms opened
    // before that keep translating into the old one. No roomAdminLang
    // field exists — ADMIN_CLINIC is a shared inbox any admin can post in
    // (see assertRoomAccess), so there's no single admin to freeze a
    // language for; admin-authored messages are assumed English, the
    // panel's working language, and only translated one-way into
    // roomClinicOwnerLang. See ChatService.resolveTranslationTarget.
    roomPatientLang: {
      type: String,
      default: null,
    },
    roomClinicOwnerLang: {
      type: String,
      default: null,
    },
    roomLastMessageAt: {
      type: Date,
      default: null, // for sorting the room list
    },
  },
  { timestamps: true },
);

// Two separate partial unique indexes so the two room kinds don't collide:
// - PATIENT_CLINIC: one room per (patient, clinic owner) pair
// - ADMIN_CLINIC: one room per clinic owner, period (shared support inbox —
//   every admin reads/writes the same thread, not one room per admin)
ChatRoomSchema.index(
  { roomPatientId: 1, roomClinicOwnerId: 1 },
  { unique: true, partialFilterExpression: { roomKind: 'PATIENT_CLINIC' } },
);
ChatRoomSchema.index(
  { roomClinicOwnerId: 1 },
  { unique: true, partialFilterExpression: { roomKind: 'ADMIN_CLINIC' } },
);

export default ChatRoomSchema;
