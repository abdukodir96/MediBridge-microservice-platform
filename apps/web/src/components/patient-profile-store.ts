"use client";

import { useSyncExternalStore } from "react";

export type PatientProfile = {
  fullName: string;
  nickname: string;
  email: string;
  phone: string;
  country: string;
  language: string;
};

export const DEFAULT_PATIENT_PROFILE: PatientProfile = {
  fullName: "Wang Lei",
  nickname: "wanglei_cn",
  email: "wang.lei@example.com",
  phone: "+86 138 0013 8000",
  country: "China",
  language: "中文 (Chinese)",
};

const PROFILE_STORAGE_KEY = "medibridge:patient-profile";
const PROFILE_UPDATE_EVENT = "medibridge-profile-update";
const DEFAULT_PROFILE_SNAPSHOT = JSON.stringify(DEFAULT_PATIENT_PROFILE);

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PROFILE_UPDATE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PROFILE_UPDATE_EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(PROFILE_STORAGE_KEY) ?? DEFAULT_PROFILE_SNAPSHOT;
}

function getServerSnapshot() {
  return DEFAULT_PROFILE_SNAPSHOT;
}

function parseProfile(snapshot: string): PatientProfile {
  try {
    return {
      ...DEFAULT_PATIENT_PROFILE,
      ...(JSON.parse(snapshot) as Partial<PatientProfile>),
    };
  } catch {
    return DEFAULT_PATIENT_PROFILE;
  }
}

export function usePatientProfile() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    profile: parseProfile(snapshot),
    snapshot,
  };
}

export function savePatientProfile(profile: PatientProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  localStorage.setItem("memberNick", profile.nickname);
  window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
  window.dispatchEvent(new Event("storage"));
}
