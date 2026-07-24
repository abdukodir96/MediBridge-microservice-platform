"use client";

import { createContext, useContext } from "react";
import type { Clinic } from "@/lib/graphql/clinics";

interface ClinicContextValue {
	clinic: Clinic;
	clinicId: string;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

// Throws on purpose: a page rendering outside the clinic dashboard layout
// (the only place that provides this context) is a wiring bug, not a state
// to render around — better to fail loudly here than silently pass around
// an undefined clinicId that breaks some later query.
export function useClinic(): ClinicContextValue {
	const ctx = useContext(ClinicContext);
	if (!ctx) {
		throw new Error("useClinic must be used within the clinic dashboard layout");
	}
	return ctx;
}

export const ClinicProvider = ClinicContext.Provider;
