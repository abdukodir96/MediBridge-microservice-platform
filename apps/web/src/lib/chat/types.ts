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

export type RoomKind = "PATIENT_CLINIC" | "ADMIN_CLINIC";

export interface ChatRoom {
	_id: string;
	roomPatientId: string | null;
	roomClinicOwnerId: string;
	roomAdminId: string | null;
	roomKind: RoomKind;
	roomBookingId: string | null;
	roomLastMessageAt: string | null;
	createdAt: string;
	updatedAt: string;
}
