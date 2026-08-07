"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProfileImage } from "@/components/use-profile-image";
import { ChatPanel } from "@/components/chat-panel";
import { useChatMessages } from "@/lib/chat/useChatMessages";

const patientNavigation = [
  { icon: "👤", label: "My Page", href: "/dashboard/patient" },
  { icon: "⌕", label: "Find clinics", href: "/clinics" },
  { icon: "💬", label: "Messages", href: "/dashboard/messages" },
];

function shortId(id: string) {
  return `#${id.slice(-6)}`;
}

export function PatientMessagesScreen() {
  const profileImage = useProfileImage();

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[720px] w-full lg:h-[calc(100svh-150px)] lg:min-h-[680px] lg:max-h-[820px] overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <PatientMessagesSidebar profileImage={profileImage} />

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {/* useSearchParams requires a Suspense boundary — matches the
              BookingSubmittedBanner pattern in dashboard-screen.tsx */}
          <Suspense fallback={null}>
            <PatientChat />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function PatientChat() {
  const roomParam = useSearchParams().get("room");
  const chat = useChatMessages(roomParam);

  return (
    <ChatPanel
      chat={chat}
      counterpartLabel={(room) => `Clinic ${shortId(chat.counterpartId(room) ?? "")}`}
    />
  );
}

function PatientMessagesSidebar({ profileImage }: { profileImage: string }) {
  return (
    <aside className="flex border-b border-brand-line bg-[#fdfcf9] lg:min-h-full lg:flex-col lg:border-b-0 lg:border-r">
      <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto p-4 lg:block lg:space-y-2 lg:p-5">
        {patientNavigation.map((item) => {
          const active = item.label === "Messages";
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-base font-semibold transition ${
                active
                  ? "bg-brand-teal-100 text-brand-teal-700"
                  : "text-brand-muted hover:bg-brand-cream hover:text-brand-teal-900"
              }`}
            >
              <span className={item.label === "Find clinics" ? "text-4xl" : "text-xl"} aria-hidden="true">
              {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-brand-line p-5 lg:block">
        <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-brand-teal-100">
          <Image
            src={profileImage}
            alt="Wang Lei"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-brand-line object-cover"
          />
          <div>
            <p className="text-sm font-bold text-brand-ink">Wang Lei</p>
            <p className="mt-0.5 text-xs text-brand-muted">Patient · 🇨🇳</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
