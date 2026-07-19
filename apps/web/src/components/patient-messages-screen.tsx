"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useProfileImage } from "@/components/use-profile-image";

type ChatMessage = {
  id: number;
  text: string;
  direction: "incoming" | "outgoing";
  time: string;
  read?: boolean;
};

type Conversation = {
  id: number;
  clinic: string;
  shortId: string;
  procedure: string;
  online: boolean;
  unread: number;
  lastActive: string;
  messages: ChatMessage[];
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    clinic: "Seoul Line Clinic",
    shortId: "#a3f...c17",
    procedure: "Rhinoplasty",
    online: true,
    unread: 1,
    lastActive: "2m",
    messages: [
      {
        id: 1,
        direction: "outgoing",
        text: "Hi! I just submitted a request for rhinoplasty. Could you let me know if Aug 12 works?",
        time: "10:24",
        read: true,
      },
      {
        id: 2,
        direction: "incoming",
        text: "We’ve received your booking request — our coordinator will review it and confirm within 24 hours.",
        time: "10:31",
      },
    ],
  },
  {
    id: 2,
    clinic: "Apgujeong Derma Center",
    shortId: "#7e2...f90",
    procedure: "Skin treatment",
    online: false,
    unread: 0,
    lastActive: "1d",
    messages: [
      {
        id: 1,
        direction: "incoming",
        text: "Thank you for your interest. Please tell us which skin concerns you would like to discuss.",
        time: "Yesterday",
      },
    ],
  },
];

const CHAT_STORAGE_KEY = "medibridge:patient-chat-history";

const patientNavigation = [
  { icon: "👤", label: "My Page", href: "/dashboard/patient" },
  { icon: "⌕", label: "Find clinics", href: "/clinics" },
  { icon: "💬", label: "Messages", href: "/dashboard/messages" },
];

export function PatientMessagesScreen() {
  const profileImage = useProfileImage();
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0].id);
  const [draft, setDraft] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const savedValue = localStorage.getItem(CHAT_STORAGE_KEY);
        if (!savedValue) return;

        const savedChat = JSON.parse(savedValue) as {
          conversations?: Conversation[];
          activeId?: number;
        };

        if (
          !Array.isArray(savedChat.conversations) ||
          savedChat.conversations.length === 0
        ) {
          return;
        }

        setConversations(savedChat.conversations);
        if (
          typeof savedChat.activeId === "number" &&
          savedChat.conversations.some(
            (conversation) => conversation.id === savedChat.activeId,
          )
        ) {
          setActiveId(savedChat.activeId);
        }
      } catch {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      } finally {
        setStorageReady(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);


  useEffect(() => {
    if (!storageReady) return;

    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({ conversations, activeId }),
    );
  }, [activeId, conversations, storageReady]);


  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeId) ??
      conversations[0],
    [activeId, conversations],
  );
  const activeMessageCount = activeConversation?.messages.length ?? 0;

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    messageList.scrollTo({
      top: messageList.scrollHeight,
      behavior: "smooth",
    });
  }, [activeId, activeMessageCount]);

  const selectConversation = (id: number) => {
    setActiveId(id);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unread: 0 }
          : conversation,
      ),
    );
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversation) return;

    const time = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              lastActive: "now",
              messages: [
                ...conversation.messages,
                {
                  id: Date.now(),
                  direction: "outgoing",
                  text,
                  time,
                  read: false,
                },
              ],
            }
          : conversation,
      ),
    );
    setDraft("");
  };

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[720px] w-full lg:h-[calc(100svh-150px)] lg:min-h-[680px] lg:max-h-[820px] overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <PatientMessagesSidebar profileImage={profileImage} />

        <div className="grid min-h-0 min-w-0 overflow-hidden md:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden border-b border-brand-line bg-white md:border-b-0 md:border-r">
            <div className="shrink-0 border-b border-brand-line px-5 py-5">
              <h1 className="font-serif text-2xl font-semibold text-brand-teal-900">
                Messages
              </h1>
              <p className="mt-1 text-sm text-brand-muted">
                {conversations.length} conversations
              </p>
            </div>

            <div className="max-h-[260px] overflow-y-auto overscroll-contain [scrollbar-gutter:stable] md:min-h-0 md:max-h-none md:flex-1">
              {conversations.map((conversation) => {
                const latestMessage =
                  conversation.messages[conversation.messages.length - 1];
                const isActive = conversation.id === activeConversation?.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className={`flex w-full gap-3 border-b border-brand-line px-5 py-4 text-left transition hover:bg-brand-cream/70 ${
                      isActive ? "bg-brand-cream" : "bg-white"
                    }`}
                  >
                    <span className="relative h-12 w-12 shrink-0 rounded-xl bg-linear-to-br from-brand-teal-500 to-brand-teal-900">
                      {conversation.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-brand-ink">
                          {conversation.clinic}{" "}
                          <span className="text-[10px] font-medium text-brand-muted">
                            {conversation.shortId}
                          </span>
                        </span>
                        <span className="shrink-0 text-[11px] text-brand-muted">
                          {conversation.lastActive}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-brand-muted">
                          {latestMessage?.text}
                        </span>
                        {conversation.unread > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-teal-700 px-1 text-[10px] font-bold text-white">
                            {conversation.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {activeConversation ? (
            <section className="flex h-[600px] min-h-0 min-w-0 flex-col bg-white md:h-full">
              <header className="flex min-h-[76px] items-center gap-3 border-b border-brand-line px-5 py-3">
                <span className="relative h-11 w-11 shrink-0 rounded-xl bg-linear-to-br from-brand-teal-500 to-brand-teal-900">
                  {activeConversation.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-brand-ink">
                    {activeConversation.clinic}
                  </h2>
                  <p
                    className={`mt-0.5 text-xs font-semibold ${
                      activeConversation.online
                        ? "text-emerald-600"
                        : "text-brand-muted"
                    }`}
                  >
                    ● {activeConversation.online ? "Online" : "Offline"}
                  </p>
                </div>
                <span className="ml-auto hidden rounded-full bg-brand-teal-100 px-3 py-1.5 text-xs font-semibold text-brand-teal-700 sm:inline-flex">
                  📋 Booking: {activeConversation.procedure}
                </span>
              </header>

              <div className="border-b border-brand-line bg-[#f0ece2] px-4 py-2 text-center text-xs font-medium text-brand-muted">
                🌐 Auto-translation isn’t available yet — messages appear exactly as typed
              </div>

              <div
                ref={messageListRef}
                className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain bg-brand-cream px-5 py-5 [scrollbar-gutter:stable]"
                aria-live="polite"
              >
                <p className="my-1 text-center text-xs text-brand-muted">Today</p>
                {activeConversation.messages.map((message, messageIndex) => (
                  <div
                    key={message.id}
                    className={`flex max-w-[82%] flex-col gap-1 sm:max-w-[68%] ${
                      message.direction === "outgoing"
                        ? "self-end items-end"
                        : "self-start items-start"
                    }`}
                  >
                    <p
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.direction === "outgoing"
                          ? "rounded-br-sm bg-brand-teal-700 text-white"
                          : "rounded-bl-sm border border-brand-line bg-white text-brand-ink"
                      }`}
                    >
                      {message.text}
                    </p>
                    <span className="flex items-center gap-1 px-1 text-[11px] text-brand-muted">
                      {message.time}
                      {message.direction === "outgoing" && (
                        <MessageReadReceipt
                          messages={activeConversation.messages}
                          messageIndex={messageIndex}
                        />
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={sendMessage}
                className="flex items-center gap-3 border-t border-brand-line bg-white px-4 py-3 sm:px-5"
              >
                <label className="sr-only" htmlFor="patient-message">
                  Type a message
                </label>
                <input
                  id="patient-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message..."
                  autoComplete="off"
                  className="h-12 min-w-0 flex-1 rounded-full border border-transparent bg-brand-cream px-5 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted focus:border-brand-teal-500 focus:ring-3 focus:ring-brand-teal-100"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-teal-700 text-base text-white transition hover:bg-brand-teal-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ➤
                </button>
              </form>
            </section>
          ) : (
            <div className="flex min-h-[560px] flex-col items-center justify-center gap-2 text-brand-muted">
              <span className="text-4xl opacity-50">💬</span>
              <p className="text-sm font-semibold">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MessageReadReceipt({
  messages,
  messageIndex,
}: {
  messages: ChatMessage[];
  messageIndex: number;
}) {
  const isRead =
    messages[messageIndex]?.read === true ||
    messages
      .slice(messageIndex + 1)
      .some((message) => message.direction === "incoming");

  return (
    <span
      aria-label={isRead ? "Read" : "Sent"}
      className={
        "inline-flex items-center text-[13px] font-bold leading-none " +
        (isRead ? "text-sky-500" : "text-brand-muted")
      }
    >
      <span>✓</span>
      {isRead && <span className="-ml-1">✓</span>}
    </span>
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
