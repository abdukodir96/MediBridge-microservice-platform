import type { ClinicSpecialty, MemberLang } from "@/lib/graphql/clinics";

// Checkbox state/URL params now carry the backend enum value directly
// (e.g. "PLASTIC_SURGERY"), not an English label — the label shown to the
// user comes from the active locale's translation file instead. These
// functions just validate untrusted URL input against the real enum sets.
const VALID_SPECIALTIES: readonly ClinicSpecialty[] = [
	"PLASTIC_SURGERY",
	"DERMATOLOGY",
	"DENTAL",
	"OPHTHALMOLOGY",
	"HAIR_TRANSPLANT",
	"ORTHOPEDICS",
];

const VALID_LANGS: readonly MemberLang[] = ["EN", "ZH", "JA", "KO"];

export function toBackendSpecialties(values: string[]): ClinicSpecialty[] {
	const valid = new Set<string>(VALID_SPECIALTIES);
	const matched = values.filter((value): value is ClinicSpecialty => valid.has(value));
	return [...new Set(matched)];
}

export function toBackendLangs(values: string[]): MemberLang[] {
	const valid = new Set<string>(VALID_LANGS);
	const matched = values.filter((value): value is MemberLang => valid.has(value));
	return [...new Set(matched)];
}
