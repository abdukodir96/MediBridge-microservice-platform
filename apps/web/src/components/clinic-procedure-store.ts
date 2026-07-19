"use client";

import { useSyncExternalStore } from "react";

export type ClinicProcedure = {
  id: string;
  name: string;
  category: string;
  description: string;
  priceMin: number;
  priceMax: number;
  currency: "USD" | "KRW";
  recoveryDays: number;
  images: string[];
};

export const DEFAULT_CLINIC_PROCEDURES: ClinicProcedure[] = [
  {
    id: "rhinoplasty",
    name: "Rhinoplasty",
    category: "Face",
    description:
      "Surgical reshaping of the nose, performed under general anesthesia. Includes pre-op consultation and 7-day recovery care.",
    priceMin: 2400,
    priceMax: 3800,
    currency: "USD",
    recoveryDays: 7,
    images: [],
  },
  {
    id: "double-eyelid-surgery",
    name: "Double Eyelid Surgery",
    category: "Eye",
    description:
      "A precise eyelid procedure designed to create a natural-looking crease with a tailored recovery plan.",
    priceMin: 1200,
    priceMax: 2000,
    currency: "USD",
    recoveryDays: 5,
    images: [],
  },
  {
    id: "v-line-face-contouring",
    name: "V-line Face Contouring",
    category: "Face",
    description:
      "Facial contouring treatment with consultation, imaging review, surgery, and coordinated aftercare.",
    priceMin: 5500,
    priceMax: 7200,
    currency: "USD",
    recoveryDays: 21,
    images: [],
  },
];

const STORAGE_KEY = "medibridge:clinic-procedures";
const UPDATE_EVENT = "medibridge-clinic-procedures-update";
const SERVER_SNAPSHOT = JSON.stringify(DEFAULT_CLINIC_PROCEDURES);

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

function parseProcedures(snapshot: string): ClinicProcedure[] {
  try {
    const parsed = JSON.parse(snapshot) as ClinicProcedure[];
    return Array.isArray(parsed) ? parsed : DEFAULT_CLINIC_PROCEDURES;
  } catch {
    return DEFAULT_CLINIC_PROCEDURES;
  }
}

function publish(procedures: ClinicProcedure[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(procedures));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function useClinicProcedures() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { procedures: parseProcedures(snapshot), snapshot };
}

export function createClinicProcedure(procedure: ClinicProcedure) {
  publish([...parseProcedures(getSnapshot()), procedure]);
}

export function updateClinicProcedure(procedure: ClinicProcedure) {
  publish(
    parseProcedures(getSnapshot()).map((item) =>
      item.id === procedure.id ? procedure : item,
    ),
  );
}

export function deleteClinicProcedure(id: string) {
  publish(parseProcedures(getSnapshot()).filter((item) => item.id !== id));
}

export function makeProcedureId(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "procedure"}-${Date.now()}`;
}
