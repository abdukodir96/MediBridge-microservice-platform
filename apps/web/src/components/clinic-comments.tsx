"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

type Reply = {
  id: string;
  author: string;
  country: string;
  text: string;
  likes: number;
  liked: boolean;
  createdAt: string;
};

type PatientComment = {
  id: string;
  author: string;
  country: string;
  avatar?: string;
  text: string;
  likes: number;
  liked: boolean;
  createdAt: string;
  replies: Reply[];
};

type ReplyTarget = {
  parentId: string;
  targetName: string;
};

export function ClinicComments({ clinicSlug, clinicName }: { clinicSlug: string; clinicName: string }) {
  const router = useRouter();
  const initialComments = useMemo(() => createInitialComments(clinicName), [clinicName]);
  const store = useMemo(
    () => createCommentStore(`medibridge-comments-${clinicSlug}`, initialComments),
    [clinicSlug, initialComments],
  );
  const comments = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const totalComments = comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);

  const requireLogin = async () => {
    if (localStorage.getItem("accessToken")) return true;
    const result = await Swal.fire({
      icon: "info",
      title: "Please, login first",
      text: "Log in to write, like, or reply to a comment.",
      showCancelButton: true,
      confirmButtonText: "Go to login",
      confirmButtonColor: "#125453",
    });
    if (result.isConfirmed) router.push("/login");
    return false;
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || !(await requireLogin())) return;

    const author = localStorage.getItem("memberNick") || "MediBridge Member";
    const nextComment: PatientComment = {
      id: crypto.randomUUID(),
      author,
      country: "MediBridge patient",
      text,
      likes: 0,
      liked: false,
      createdAt: "Just now",
      replies: [],
    };
    store.update((current) => [nextComment, ...current]);
    setCommentText("");
  };

  const toggleLike = async (commentId: string, replyId?: string) => {
    if (!(await requireLogin())) return;
    store.update((current) =>
      current.map((comment) => {
        if (comment.id !== commentId) return comment;
        if (!replyId) {
          return {
            ...comment,
            liked: !comment.liked,
            likes: Math.max(0, comment.likes + (comment.liked ? -1 : 1)),
          };
        }
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            reply.id === replyId
              ? { ...reply, liked: !reply.liked, likes: Math.max(0, reply.likes + (reply.liked ? -1 : 1)) }
              : reply,
          ),
        };
      }),
    );
  };

  const openReply = async (parentId: string, targetName: string) => {
    if (!(await requireLogin())) return;
    setReplyTarget({ parentId, targetName });
    setReplyText("");
  };

  const submitReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = replyText.trim();
    if (!replyTarget || !text || !(await requireLogin())) return;

    const author = localStorage.getItem("memberNick") || "MediBridge Member";
    const reply: Reply = {
      id: crypto.randomUUID(),
      author,
      country: "MediBridge patient",
      text: `@${replyTarget.targetName} ${text}`,
      likes: 0,
      liked: false,
      createdAt: "Just now",
    };
    store.update((current) =>
      current.map((comment) =>
        comment.id === replyTarget.parentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment,
      ),
    );
    setReplyTarget(null);
    setReplyText("");
  };

  return (
    <section className="mt-12 border-t border-brand-line pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-teal-500">Patient experiences</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-teal-900">Patient comments</h2>
        </div>
        <strong className="text-lg text-brand-teal-700">{totalComments} comments</strong>
      </div>

      <form onSubmit={submitComment} className="rounded-2xl border border-brand-line bg-brand-cream/35 p-4 sm:p-5">
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          onFocus={() => void requireLogin()}
          placeholder="Share your experience..."
          rows={4}
          className="w-full resize-y bg-transparent text-base leading-7 text-brand-ink outline-none placeholder:text-brand-muted/80"
        />
        <div className="mt-3 flex justify-end">
          <button type="submit" className="rounded-xl bg-brand-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-teal-900">
            Post comment
          </button>
        </div>
      </form>

      <div className="mt-7 divide-y divide-brand-line">
        {comments.map((comment) => (
          <article key={comment.id} className="py-7 first:pt-0">
            <CommentIdentity
              name={comment.author}
              country={comment.country}
              avatar={comment.avatar}
              createdAt={comment.createdAt}
            />
            <p className="ml-14 mt-3 text-base leading-7 text-brand-ink sm:ml-16">{comment.text}</p>
            <CommentActions
              className="ml-14 sm:ml-16"
              likes={comment.likes}
              liked={comment.liked}
              onLike={() => void toggleLike(comment.id)}
              onReply={() => void openReply(comment.id, comment.author)}
            />

            {comment.replies.length > 0 && (
              <div className="ml-8 mt-5 space-y-4 border-l-2 border-brand-teal-100 pl-5 sm:ml-16 sm:pl-7">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="rounded-xl bg-brand-teal-100/35 p-4 sm:p-5">
                    <CommentIdentity name={reply.author} country={reply.country} createdAt={reply.createdAt} compact />
                    <p className="mt-3 text-base leading-7 text-brand-ink">{reply.text}</p>
                    <CommentActions
                      likes={reply.likes}
                      liked={reply.liked}
                      onLike={() => void toggleLike(comment.id, reply.id)}
                      onReply={() => void openReply(comment.id, reply.author)}
                    />
                  </div>
                ))}
              </div>
            )}

            {replyTarget?.parentId === comment.id && (
              <form onSubmit={submitReply} className="ml-8 mt-5 rounded-xl border border-brand-line bg-white p-4 sm:ml-16">
                <p className="mb-2 text-xs font-semibold text-brand-teal-700">Replying to {replyTarget.targetName}</p>
                <textarea
                  autoFocus
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full resize-y text-base leading-7 text-brand-ink outline-none placeholder:text-brand-muted/75"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setReplyTarget(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-cream">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-lg bg-brand-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-teal-900">
                    Post reply
                  </button>
                </div>
              </form>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function CommentIdentity({
  name,
  country,
  avatar,
  createdAt,
  compact = false,
}: {
  name: string;
  country: string;
  avatar?: string;
  createdAt: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative shrink-0 overflow-hidden rounded-full bg-brand-teal-700 text-white ${compact ? "h-10 w-10" : "h-12 w-12"}`}>
        {avatar ? (
          <Image src={avatar} alt="" fill sizes={compact ? "40px" : "48px"} className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-bold">{initials(name)}</span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold text-brand-ink">{name}</h3>
        <p className="text-xs text-brand-muted">{country} · {createdAt}</p>
      </div>
    </div>
  );
}

function CommentActions({
  likes,
  liked,
  onLike,
  onReply,
  className = "",
}: {
  likes: number;
  liked: boolean;
  onLike: () => void;
  onReply: () => void;
  className?: string;
}) {
  return (
    <div className={`mt-3 flex items-center gap-5 text-sm font-semibold text-brand-muted ${className}`}>
      <button type="button" onClick={onLike} className={`flex items-center gap-1.5 transition hover:text-brand-teal-700 ${liked ? "text-rose-500" : ""}`}>
        <span>{liked ? "♥" : "♡"}</span> {likes}
      </button>
      <button type="button" onClick={onReply} className="transition hover:text-brand-teal-700">Reply</button>
    </div>
  );
}

function createInitialComments(clinicName: string): PatientComment[] {
  return [
    {
      id: "wang-l",
      author: "Wang L.",
      country: "🇨🇳 Shanghai, China",
      avatar: "/user/female-1.jpg",
      text: `The coordinator explained everything clearly during my consultation at ${clinicName}. The escrow payment made me feel safe before arriving, and the follow-up care was excellent.`,
      likes: 18,
      liked: false,
      createdAt: "2 weeks ago",
      replies: [
        {
          id: "clinic-reply-1",
          author: clinicName,
          country: "Clinic team",
          text: "Thank you for sharing your experience. We are glad you felt supported throughout your journey.",
          likes: 4,
          liked: false,
          createdAt: "12 days ago",
        },
      ],
    },
    {
      id: "yuki-t",
      author: "Yuki T.",
      country: "🇯🇵 Osaka, Japan",
      avatar: "/user/male-3.jpg",
      text: "Booking through MediBridge was much easier than contacting clinics one by one. Pricing was transparent and I could ask questions before deciding.",
      likes: 11,
      liked: false,
      createdAt: "1 month ago",
      replies: [],
    },
  ];
}

function createCommentStore(storageKey: string, initialValue: PatientComment[]) {
  let current = initialValue;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) current = JSON.parse(saved) as PatientComment[];
    } catch {
      current = initialValue;
    }
  };

  const emit = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener: () => void) {
      hydrate();
      listeners.add(listener);
      const handleStorage = (event: StorageEvent) => {
        if (event.key !== storageKey || !event.newValue) return;
        try {
          current = JSON.parse(event.newValue) as PatientComment[];
          emit();
        } catch {
          // Ignore malformed external storage values.
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
      };
    },
    getSnapshot() {
      hydrate();
      return current;
    },
    getServerSnapshot() {
      return initialValue;
    },
    update(updater: (comments: PatientComment[]) => PatientComment[]) {
      hydrate();
      current = updater(current);
      localStorage.setItem(storageKey, JSON.stringify(current));
      emit();
    },
  };
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
