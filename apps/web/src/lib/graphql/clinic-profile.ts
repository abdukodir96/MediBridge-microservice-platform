import type { ClinicSpecialty, MemberLang } from "@/lib/graphql/clinics";

export interface ClinicProfile {
	clinicName: string;
	clinicDesc: string;
	clinicAddress: string;
	clinicImages: string[];
	clinicSpecialties: ClinicSpecialty[];
	clinicLangs: MemberLang[];
	clinicRating: number;
	clinicReviewCount: number;
}

export interface ClinicProcedure {
	_id: string;
	procedureName: string;
	procedureCategory: string;
	procedureDesc: string;
	procedurePriceMin: number;
	procedurePriceMax: number;
	procedureCurrency: string;
	procedureDuration: number;
}

const GET_CLINIC_PROFILE_QUERY = `
	query GetClinicProfile($clinicId: String!) {
		getClinic(clinicId: $clinicId) {
			clinicName
			clinicDesc
			clinicAddress
			clinicImages
			clinicSpecialties
			clinicLangs
			clinicRating
			clinicReviewCount
		}
		getProceduresByClinic(clinicId: $clinicId) {
			total
			list {
				_id
				procedureName
				procedureCategory
				procedureDesc
				procedurePriceMin
				procedurePriceMax
				procedureCurrency
				procedureDuration
			}
		}
	}
`;

// Runs server-side (this page is a Server Component), so a plain fetch is
// enough — no need for the browser-oriented Apollo Client used elsewhere.
// Returns null for both "invalid id" and "clinic not found / not verified":
// getClinic's return type is non-null, so a thrown NotFoundException/
// BadRequestException on the backend makes the whole GraphQL response's
// `data` come back null with only `errors` populated — that's our signal
// to call notFound() in the page.
export async function fetchClinicProfile(
	clinicId: string,
): Promise<{ clinic: ClinicProfile; procedures: ClinicProcedure[] } | null> {
	const res = await fetch(process.env.NEXT_PUBLIC_GATEWAY_URL as string, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query: GET_CLINIC_PROFILE_QUERY, variables: { clinicId } }),
		cache: "no-store",
	});

	const json = (await res.json()) as {
		data: { getClinic: ClinicProfile; getProceduresByClinic: { list: ClinicProcedure[] } } | null;
	};

	if (!json.data) return null;

	return {
		clinic: json.data.getClinic,
		procedures: json.data.getProceduresByClinic.list,
	};
}
