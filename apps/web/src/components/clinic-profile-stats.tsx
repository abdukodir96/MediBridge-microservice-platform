"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

type EngagementState = {
  likes: number;
  views: number;
  liked: boolean;
};

export function ClinicProfileStats({
  clinicSlug,
  initialLikes = 286,
  initialViews = 1248,
}: {
  clinicSlug: string;
  initialLikes?: number;
  initialViews?: number;
}) {
  const router = useRouter();
  const initialState = useMemo(
    () => ({ likes: initialLikes, views: initialViews, liked: false }),
    [initialLikes, initialViews],
  );
  const store = useMemo(
    () => createEngagementStore(`medibridge-clinic-engagement-${clinicSlug}`, clinicSlug, initialState),
    [clinicSlug, initialState],
  );
  const engagement = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  useEffect(() => {
    store.recordView();
  }, [store]);

  const toggleLike = async () => {
    if (!localStorage.getItem("accessToken")) {
      const result = await Swal.fire({
        icon: "info",
        title: "Please, login first",
        text: "Log in to like this clinic.",
        showCancelButton: true,
        confirmButtonText: "Go to login",
        confirmButtonColor: "#125453",
      });
      if (result.isConfirmed) router.push("/login");
      return;
    }
    store.toggleLike();
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void toggleLike()}
        aria-pressed={engagement.liked}
        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition duration-200 ${
          engagement.liked
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : "border-brand-line bg-white text-brand-muted hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        }`}
      >
        <span className="text-lg leading-none">{engagement.liked ? "♥" : "♡"}</span>
        {engagement.likes.toLocaleString()} likes
      </button>
      <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-brand-line bg-brand-cream/55 px-4 text-sm font-semibold text-brand-muted">
        <span aria-hidden="true">👁</span>
        {engagement.views.toLocaleString()} views
      </span>
    </div>
  );
}

function createEngagementStore(storageKey: string, clinicSlug: string, initialState: EngagementState) {
  let current = initialState;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) current = JSON.parse(saved) as EngagementState;
    } catch {
      current = initialState;
    }
  };

  const persist = () => {
    localStorage.setItem(storageKey, JSON.stringify(current));
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener: () => void) {
      hydrate();
      listeners.add(listener);
      const handleStorage = (event: StorageEvent) => {
        if (event.key !== storageKey || !event.newValue) return;
        try {
          current = JSON.parse(event.newValue) as EngagementState;
          listeners.forEach((subscriber) => subscriber());
        } catch {
          // Ignore malformed values from another tab.
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
      return initialState;
    },
    recordView() {
      hydrate();
      const sessionKey = `medibridge-viewed-${clinicSlug}`;
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "true");
      current = { ...current, views: current.views + 1 };
      persist();
    },
    toggleLike() {
      hydrate();
      current = {
        ...current,
        liked: !current.liked,
        likes: Math.max(0, current.likes + (current.liked ? -1 : 1)),
      };
      persist();
    },
  };
}
