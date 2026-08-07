"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectChatSocket, disconnectChatSocket, getMyMemberId } from "./socket";
import type { ChatMessage, ChatRoom } from "./types";

export function useChatMessages(preselectedRoomId?: string | null) {
	const socketRef = useRef<Socket | null>(null);
	// Lazy initializer (not effect setState) — guarded the same way as before
	// so it never touches localStorage during the server render pass.
	const [myId] = useState<string | null>(() =>
		typeof window === "undefined" ? null : getMyMemberId(),
	);
	// Stale-closure guard — see patient-messages-screen.tsx history: the
	// 'newMessage' listener is registered once inside the connect effect, so
	// a plain activeRoomId read there would always see its mount-time value.
	const activeRoomIdRef = useRef<string | null>(null);

	const [connected, setConnected] = useState(false);
	const [rooms, setRooms] = useState<ChatRoom[]>([]);
	const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [error, setError] = useState<string | null>(null);

	const selectRoom = (roomId: string) => {
		setActiveRoomId(roomId);
		activeRoomIdRef.current = roomId;
		setMessages([]);
		setError(null);
		socketRef.current?.emit(
			"joinRoom",
			{ roomId },
			(res: { status: string; messages?: ChatMessage[]; message?: string }) => {
				if (res.status === "roomJoined" && res.messages) setMessages(res.messages);
				else setError(res.message ?? "Failed to open conversation");
			},
		);
	};

	useEffect(() => {
		const socket = connectChatSocket();
		socketRef.current = socket;

		socket.on("connect", () => {
			setConnected(true);
			socket.emit(
				"getMyRooms",
				{},
				(res: { status: string; rooms?: ChatRoom[]; message?: string }) => {
					if (res.status === "ok" && res.rooms) {
						setRooms(res.rooms);
						if (preselectedRoomId) selectRoom(preselectedRoomId);
					} else {
						setError(res.message ?? "Failed to load conversations");
					}
				},
			);
		});

		socket.on("disconnect", () => setConnected(false));

		socket.on("newMessage", (message: ChatMessage) => {
			if (message.messageRoomId !== activeRoomIdRef.current) return;
			setMessages((current) => [...current, message]);
		});

		return () => disconnectChatSocket();
		// preselectedRoomId is intentionally excluded — it should only drive
		// room selection on the initial connect, not force a reconnect if the
		// URL param were to change later in the same session.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sendMessage = (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || !activeRoomId) return;
		socketRef.current?.emit(
			"sendMessage",
			{ roomId: activeRoomId, text: trimmed },
			(res: { status: string; message?: string }) => {
				// No optimistic append — the server broadcasts the saved message
				// back over 'newMessage' to everyone in the room, including the
				// sender. Appending it here too would double it up.
				if (res.status !== "sent") setError(res.message ?? "Failed to send");
			},
		);
	};

	// The "other side" of a room — clinic owner if I'm the patient, patient if
	// I'm the clinic owner — so the same UI code works for both roles.
	const counterpartId = (room: ChatRoom) =>
		room.roomPatientId === myId ? room.roomClinicOwnerId : room.roomPatientId;

	return {
		myId,
		connected,
		rooms,
		activeRoomId,
		messages,
		error,
		selectRoom,
		sendMessage,
		counterpartId,
	};
}
