import type { ClinicSort } from "@/lib/graphql/clinics";

// UI'dagi (ClinicsSort komponenti) sort qiymatlari → backend enum
const SORT_MAP: Record<string, ClinicSort> = {
	"top-rated": "TOP_RATED",
	"most-reviewed": "MOST_REVIEWED",
	"price-low": "PRICE_LOW",
	"price-high": "PRICE_HIGH",
};

export function toBackendSort(uiSort: string | null | undefined): ClinicSort {
	return SORT_MAP[uiSort ?? "top-rated"] ?? "TOP_RATED";
}
