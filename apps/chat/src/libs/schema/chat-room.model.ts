import { Schema } from 'mongoose';

const ChatRoomSchema = new Schema(
	{
		roomPatientId: {
			type: String, // Core's Member ObjectId — cross-service, hence String
			required: true,
		},
		roomClinicOwnerId: {
			type: String, // Core's clinic owner Member ObjectId (not the Clinic ID —
			// stored this way so access checks don't need a round trip to Core)
			required: true,
		},
		roomBookingId: {
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

// ONE PAIR — ONE ROOM (a single room per patient + clinic owner)
ChatRoomSchema.index({ roomPatientId: 1, roomClinicOwnerId: 1 }, { unique: true });

export default ChatRoomSchema;
