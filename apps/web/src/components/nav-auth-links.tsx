"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useApolloClient } from "@apollo/client/react";

export type MemberType = "PATIENT" | "CLINIC";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem("memberType") as MemberType | null;
}

function getServerSnapshot() {
  return null;
}

export function useMemberType() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function NavAuthLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const apolloClient = useApolloClient();
  const memberType = useMemberType();
  const previewType: MemberType =
    pathname.startsWith("/dashboard/clinic") ? "CLINIC" : "PATIENT";
  const visibleType =
    memberType ?? (process.env.NODE_ENV === "development" ? previewType : null);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const logOut = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("memberType");
    // Clears Apollo's InMemoryCache without refetching active queries — the
    // next page is /login anyway. Without this, a subsequent login as a
    // different member could briefly show the previous session's cached
    // getMyProfile/getMyBookings results before fresh data arrives.
    await apolloClient.clearStore();
    setOpen(false);
    router.push("/login");
  };

  if (visibleType !== "PATIENT" && visibleType !== "CLINIC") return null;

  const label = visibleType === "PATIENT" ? "My Page" : "My Clinic";
  const href = visibleType === "PATIENT" ? "/dashboard/patient" : "/dashboard/clinic";

  // No real session yet (dev-only preview of the nav link) — plain link,
  // nothing to log out of.
  if (!memberType) {
    return (
      <Link href={href} className="whitespace-nowrap transition hover:text-brand-teal-700">
        {label}
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 whitespace-nowrap transition hover:text-brand-teal-700"
      >
        {label}
        <span className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 top-[calc(100%+10px)] z-50 w-44 origin-top-right rounded-xl border border-brand-line bg-white p-1.5 text-sm shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-200 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <Link
          href={href}
          role="menuitem"
          onClick={() => setOpen(false)}
          className="block rounded-lg px-3.5 py-2.5 text-left font-medium text-brand-ink transition hover:bg-brand-cream"
        >
          {label}
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={() => void logOut()}
          className="block w-full rounded-lg px-3.5 py-2.5 text-left font-semibold text-red-600 transition hover:bg-red-50"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
