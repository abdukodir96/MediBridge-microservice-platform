"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

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
  const memberType = useMemberType();
  const previewType: MemberType =
    pathname.startsWith("/dashboard/clinic") ? "CLINIC" : "PATIENT";
  const visibleType =
    memberType ?? (process.env.NODE_ENV === "development" ? previewType : null);

  if (visibleType === "PATIENT") {
    return (
      <Link
        href="/dashboard/patient"
        className="whitespace-nowrap transition hover:text-brand-teal-700"
      >
        My Page
      </Link>
    );
  }

  if (visibleType === "CLINIC") {
    return (
      <Link
        href="/dashboard/clinic"
        className="whitespace-nowrap transition hover:text-brand-teal-700"
      >
        My Clinic
      </Link>
    );
  }

  return null;
}
