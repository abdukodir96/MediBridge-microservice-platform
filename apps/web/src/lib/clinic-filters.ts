import type { ClinicSpecialty, MemberLang } from "@/lib/graphql/clinics";

// ClinicsFilterPanel'dagi "Specialty" checkbox yorliqlari → backend enum.
// Rhinoplasty/Face Contour alohida ClinicSpecialty qiymati emas — ikkalasi
// ham PLASTIC_SURGERY klinikalarining protsedura nomlari (seed'dagi kabi).
const SPECIALTY_LABEL_MAP: Record<string, ClinicSpecialty> = {
	"Plastic Surgery": "PLASTIC_SURGERY",
	"Rhinoplasty": "PLASTIC_SURGERY",
	"Face Contour": "PLASTIC_SURGERY",
	"Dermatology": "DERMATOLOGY",
	"Dental": "DENTAL",
	"Hair Transplant": "HAIR_TRANSPLANT",
};

// ClinicsFilterPanel'dagi "Language support" checkbox qiymatlari → backend enum
const LANGUAGE_LABEL_MAP: Record<string, MemberLang> = {
	Chinese: "ZH",
	Japanese: "JA",
	English: "EN",
};

export function toBackendSpecialties(labels: string[]): ClinicSpecialty[] {
	const mapped = labels.map((label) => SPECIALTY_LABEL_MAP[label]).filter(Boolean);
	return [...new Set(mapped)];
}

export function toBackendLangs(labels: string[]): MemberLang[] {
	const mapped = labels.map((label) => LANGUAGE_LABEL_MAP[label]).filter(Boolean);
	return [...new Set(mapped)];
}
