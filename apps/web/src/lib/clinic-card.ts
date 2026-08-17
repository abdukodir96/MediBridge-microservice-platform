import type { Clinic } from "@/lib/graphql/clinics";

export const CARD_GRADIENTS = [
	"from-brand-teal-500 to-brand-teal-900",
	"from-brand-teal-700 to-brand-teal-900",
	"from-brand-teal-900 to-brand-teal-500",
	"from-brand-teal-500 to-brand-teal-700",
];

export type ClinicBadgeKey = "TOP_RATED" | "PATIENT_CHOICE" | "INTERNATIONAL_FRIENDLY" | "VERIFIED";

export function clinicBadgeKey(clinic: Clinic): ClinicBadgeKey {
	if (clinic.clinicRating >= 4.9) return "TOP_RATED";
	if (clinic.clinicReviewCount >= 400) return "PATIENT_CHOICE";
	if (clinic.clinicLangs.length > 1) return "INTERNATIONAL_FRIENDLY";
	return "VERIFIED";
}

const BADGE_LABELS: Record<ClinicBadgeKey, string> = {
	TOP_RATED: "Top Rated",
	PATIENT_CHOICE: "Patient Choice",
	INTERNATIONAL_FRIENDLY: "International Friendly",
	VERIFIED: "Verified",
};

// English-only — used as-is on pages not yet wired to translations (landing,
// clinic detail). /clinics/page.tsx uses clinicBadgeKey() directly instead,
// so only the "Verified" case (the one with a real translation) needs
// overriding there.
export function clinicBadge(clinic: Clinic): string {
	return BADGE_LABELS[clinicBadgeKey(clinic)];
}
