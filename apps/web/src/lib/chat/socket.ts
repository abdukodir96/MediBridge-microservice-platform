import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectChatSocket(): Socket {
	const token = localStorage.getItem("accessToken");
	socket = io(process.env.NEXT_PUBLIC_CHAT_WS_URL ?? "http://localhost:3005", {
		auth: { token },
	});
	return socket;
}

export function disconnectChatSocket() {
	socket?.disconnect();
	socket = null;
}

// Display-only — decodes the token payload (the server independently
// authenticates every action regardless), just so the UI knows "which
// messages are mine" for left/right bubble alignment.
export function getMyMemberId(): string | null {
	const token = localStorage.getItem("accessToken");
	if (!token) return null;
	try {
		return JSON.parse(atob(token.split(".")[1]))._id ?? null;
	} catch {
		return null;
	}
}
