"use client";

import { useSyncExternalStore } from "react";

export type ClinicProfile = {
  name: string;
  address: string;
  description: string;
  specialties: string[];
  languages: string[];
  gallery: string[];
};

export const DEFAULT_CLINIC_PROFILE: ClinicProfile = {
  name: "Seoul Line Clinic",
  address: "Gangnam-gu, Seoul, South Korea",
  description:
    "Established in 2009 in the heart of Gangnam, Seoul Line Clinic specializes in natural-looking facial contouring and rhinoplasty. Our board-certified surgeons have treated over 8,000 international patients.",
  specialties: ["Plastic Surgery"],
  languages: ["English", "中文 Chinese"],
  gallery: ["clinic-gallery-1", "clinic-gallery-2", "clinic-gallery-3"],
};

const STORAGE_KEY = "medibridge:clinic-profile";
const UPDATE_EVENT = "medibridge-clinic-profile-update";
const SERVER_SNAPSHOT = JSON.stringify(DEFAULT_CLINIC_PROFILE);

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(UPDATE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(UPDATE_EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? SERVER_SNAPSHOT;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function parseProfile(snapshot: string): ClinicProfile {
  try {
    const parsed = JSON.parse(snapshot) as Partial<ClinicProfile>;
    return {
      ...DEFAULT_CLINIC_PROFILE,
      ...parsed,
      specialties: Array.isArray(parsed.specialties)
        ? parsed.specialties
        : DEFAULT_CLINIC_PROFILE.specialties,
      languages: Array.isArray(parsed.languages)
        ? parsed.languages
        : DEFAULT_CLINIC_PROFILE.languages,
      gallery: Array.isArray(parsed.gallery)
        ? parsed.gallery
        : DEFAULT_CLINIC_PROFILE.gallery,
    };
  } catch {
    return DEFAULT_CLINIC_PROFILE;
  }
}

export function useClinicProfile() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { profile: parseProfile(snapshot), snapshot };
}

export function saveClinicProfile(profile: ClinicProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}
