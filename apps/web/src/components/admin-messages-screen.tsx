"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatPanel } from "@/components/chat-panel";
import { useChatMessages } from "@/lib/chat/useChatMessages";

export function AdminMessagesScreen() {
  return (
    <div className="flex h-[calc(100vh-165px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-brand-line bg-white">
      {/* useSearchParams requires a Suspense boundary — same pattern as
          Patient/Clinic Messages */}
      <Suspense fallback={null}>
        <AdminChat />
      </Suspense>
    </div>
  );
}

function AdminChat() {
  const roomParam = useSearchParams().get("room");
  const chat = useChatMessages(roomParam);

  return (
    <ChatPanel
      chat={chat}
      // roomPatientId is always null on an ADMIN_CLINIC room, so the "other
      // side" is always the clinic — no need for counterpartId's
      // patient-vs-clinic-owner branching here.
      counterpartLabel={(room) => `Clinic #${room.roomClinicOwnerId.slice(-6)}`}
    />
  );
}
