"use client";

import { useEffect, useRef, useState } from "react";
import type { useChatMessages } from "@/lib/chat/useChatMessages";
import type { ChatRoom } from "@/lib/chat/types";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Shared between the patient and clinic Messages screens — the underlying
// socket logic (useChatMessages) is already role-neutral, and so is this
// view; only counterpartLabel (how to name "the other side" of a room) and
// the surrounding sidebar/layout differ per role.
export function ChatPanel({
  chat,
  counterpartLabel,
}: {
  chat: ReturnType<typeof useChatMessages>;
  counterpartLabel: (room: ChatRoom) => string;
}) {
  const { connected, rooms, activeRoomId, messages, error, myId, selectRoom, sendMessage } = chat;
  const [draft, setDraft] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const activeRoom = rooms.find((room) => room._id === activeRoomId);

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <>
      <div className="grid min-h-0 min-w-0 flex-1 overflow-hidden md:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-brand-line bg-white md:border-b-0 md:border-r">
          <div className="shrink-0 border-b border-brand-line px-5 py-5">
            <h1 className="font-serif text-2xl font-semibold text-brand-teal-900">Messages</h1>
            <p className="mt-1 text-sm text-brand-muted">
              {rooms.length} conversations {connected ? "" : "· connecting..."}
            </p>
          </div>

          <div className="max-h-[260px] overflow-y-auto overscroll-contain [scrollbar-gutter:stable] md:min-h-0 md:max-h-none md:flex-1">
            {rooms.map((room) => {
              const isActive = room._id === activeRoomId;
              return (
                <button
                  key={room._id}
                  type="button"
                  onClick={() => selectRoom(room._id)}
                  className={`flex w-full gap-3 border-b border-brand-line px-5 py-4 text-left transition hover:bg-brand-cream/70 ${
                    isActive ? "bg-brand-cream" : "bg-white"
                  }`}
                >
                  <span className="h-12 w-12 shrink-0 rounded-xl bg-linear-to-br from-brand-teal-500 to-brand-teal-900" />
                  <span className="min-w-0 flex-1">
                    <span className="truncate text-sm font-bold text-brand-ink">
                      {counterpartLabel(room)}
                    </span>
                    {room.roomBookingId && (
                      <span className="mt-1 block text-xs text-brand-muted">
                        Linked to a booking
                      </span>
                    )}
                  </span>
                </button>
              );
            })}

            {rooms.length === 0 && connected && (
              <div className="px-5 py-10 text-center text-sm text-brand-muted">
                No conversations yet.
              </div>
            )}
          </div>
        </aside>

        {!activeRoom ? (
          <div className="flex min-h-[560px] flex-col items-center justify-center gap-2 text-brand-muted">
            <span className="text-4xl opacity-50">💬</span>
            <p className="text-sm font-semibold">Select a conversation</p>
          </div>
        ) : (
          <section className="flex h-[600px] min-h-0 min-w-0 flex-col bg-white md:h-full">
            <header className="flex min-h-[76px] items-center gap-3 border-b border-brand-line px-5 py-3">
              <span className="h-11 w-11 shrink-0 rounded-xl bg-linear-to-br from-brand-teal-500 to-brand-teal-900" />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-brand-ink">
                  {counterpartLabel(activeRoom)}
                </h2>
              </div>
            </header>

            <div className="border-b border-brand-line bg-[#f0ece2] px-4 py-2 text-center text-xs font-medium text-brand-muted">
              🌐 Auto-translation isn&apos;t available yet — messages appear exactly as typed
            </div>

            <div
              ref={messageListRef}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain bg-brand-cream px-5 py-5 [scrollbar-gutter:stable]"
              aria-live="polite"
            >
              {messages.map((message) => {
                const isMine = message.messageSenderId === myId;
                return (
                  <div
                    key={message._id}
                    className={`flex max-w-[82%] flex-col gap-1 sm:max-w-[68%] ${
                      isMine ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <p
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isMine
                          ? "rounded-br-sm bg-brand-teal-700 text-white"
                          : "rounded-bl-sm border border-brand-line bg-white text-brand-ink"
                      }`}
                    >
                      {message.messageText}
                    </p>
                    <span className="flex items-center gap-1 px-1 text-[11px] text-brand-muted">
                      {formatTime(message.createdAt)}
                      {isMine && (
                        <span
                          aria-label={message.messageRead ? "Read" : "Sent"}
                          className={`inline-flex items-center font-bold leading-none ${
                            message.messageRead ? "text-sky-500" : "text-brand-muted"
                          }`}
                        >
                          <span>✓</span>
                          {message.messageRead && <span className="-ml-1">✓</span>}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <p className="my-auto text-center text-sm text-brand-muted">
                  No messages yet — say hello.
                </p>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-3 border-t border-brand-line bg-white px-4 py-3 sm:px-5"
            >
              <label className="sr-only" htmlFor="chat-message">
                Type a message
              </label>
              <input
                id="chat-message"
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
        )}
      </div>

      {error && (
        <p className="mx-6 mt-3 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
