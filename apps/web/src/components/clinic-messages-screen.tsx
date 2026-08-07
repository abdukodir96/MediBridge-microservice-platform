"use client";

import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { ChatPanel } from "@/components/chat-panel";
import { useProfileImage } from "@/components/use-profile-image";
import { useClinic } from "@/context/clinic-context";
import { useChatMessages } from "@/lib/chat/useChatMessages";

function shortId(id: string) {
  return `#${id.slice(-6)}`;
}

export function ClinicMessagesScreen() {
  const profileImage = useProfileImage();
  const { clinic } = useClinic();
  const chat = useChatMessages();

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[720px] w-full lg:h-[calc(100svh-150px)] lg:min-h-[680px] lg:max-h-[820px] overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel="Messages"
          identityName={clinic.clinicName}
        />

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <ChatPanel
            chat={chat}
            counterpartLabel={(room) =>
              room.roomKind === "ADMIN_CLINIC"
                ? "🛡 MediBridge Admin"
                : `Patient ${shortId(chat.counterpartId(room) ?? "")}`
            }
          />
        </div>
      </div>
    </main>
  );
}
