import type { Clinic } from "@/lib/graphql/clinics";

export const CARD_GRADIENTS = [
	"from-brand-teal-500 to-brand-teal-900",
	"from-brand-teal-700 to-brand-teal-900",
	"from-brand-teal-900 to-brand-teal-500",
	"from-brand-teal-500 to-brand-teal-700",
];

export function clinicBadge(clinic: Clinic): string {
	if (clinic.clinicRating >= 4.9) return "Top Rated";
	if (clinic.clinicReviewCount >= 400) return "Patient Choice";
	if (clinic.clinicLangs.length > 1) return "International Friendly";
	return "Verified";
}
