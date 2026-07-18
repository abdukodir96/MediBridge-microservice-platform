"use client";

import { useSyncExternalStore } from "react";

export const DEFAULT_PROFILE_IMAGE = "/user/default.jpg";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  const image = localStorage.getItem("memberImage");
  return image?.startsWith("/") || image?.startsWith("data:")
    ? image
    : DEFAULT_PROFILE_IMAGE;
}

function getServerSnapshot() {
  return DEFAULT_PROFILE_IMAGE;
}

export function useProfileImage() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
