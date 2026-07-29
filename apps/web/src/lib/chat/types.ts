export interface ChatMessage {
	_id: string;
	messageRoomId: string;
	messageSenderId: string;
	messageText: string;
	messageTranslatedText: string | null;
	messageLang: string | null;
	messageRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ChatRoom {
	_id: string;
	roomPatientId: string;
	roomClinicOwnerId: string;
	roomBookingId: string | null;
	roomLastMessageAt: string | null;
	createdAt: string;
	updatedAt: string;
}
