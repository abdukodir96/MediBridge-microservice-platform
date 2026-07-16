import { Schema } from 'mongoose';

const MessageSchema = new Schema(
	{
		messageRoomId: {
			type: Schema.Types.ObjectId,
			ref: 'ChatRoom',
			required: true,
		},
		messageSenderId: {
			type: String, // Core Member ID
			required: true,
		},
		messageText: {
			type: String,
			required: true,
			maxlength: 2000,
		},
		messageTranslatedText: {
			type: String,
			default: null, // filled in later by the AI service
		},
		messageLang: {
			type: String,
			default: null,
		},
		messageRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

// So a room's history can be fetched fast
MessageSchema.index({ messageRoomId: 1, createdAt: -1 });

export default MessageSchema;
