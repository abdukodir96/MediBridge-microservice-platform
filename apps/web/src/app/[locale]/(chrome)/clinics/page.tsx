import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LikeButton } from "@/components/like-button";
import { Pagination } from "@/components/pagination";
import { ClinicsFilterPanel, ClinicsSort } from "@/components/clinics-filter-panel";
import { fetchClinics } from "@/lib/graphql/clinics";
import { toBackendSort } from "@/lib/clinic-sort";
import { toBackendSpecialties, toBackendLangs } from "@/lib/clinic-filters";
import { CARD_GRADIENTS, clinicBadge, clinicBadgeKey } from "@/lib/clinic-card";

const CLINICS_PER_PAGE = 6;

type SearchParams = Record<string, string | string[] | undefined>;

// searchParams values can be string[] if a key repeats in the URL (never
// happens from our own UI, which always writes a single comma-joined
// value, but a hand-crafted URL could) — take the first occurrence rather
// than letting later code choke on an array where a string is expected.
function firstParam(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function parseList(value: string | null) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function clampPrice(value: string | null, fallback: number) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(8000, Math.max(0, parsed)) : fallback;
}

export default async function ClinicsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, t] = await Promise.all([searchParams, getTranslations("clinics")]);

  const selectedSpecialties = parseList(firstParam(params.specialties) ?? firstParam(params.treatment));
  const selectedLocations = parseList(firstParam(params.locations) ?? firstParam(params.city));
  const selectedLanguages = parseList(firstParam(params.languages) ?? firstParam(params.language));
  const minPrice = clampPrice(firstParam(params.minPrice), 0);
  const maxPrice = clampPrice(firstParam(params.maxPrice), 8000);
  const rawSort = firstParam(params.sort);
  const uiSort = ["most-reviewed", "price-low", "price-high"].includes(rawSort ?? "")
    ? (rawSort as string)
    : "top-rated";
  const requestedPage = Math.max(1, Number.parseInt(firstParam(params.page) ?? "1", 10) || 1);

  const backendSpecialties = toBackendSpecialties(selectedSpecialties);
  const backendLangs = toBackendLangs(selectedLanguages);

  const {
    list: clinics,
    total,
    error,
  } = await fetchClinics({
    specialties: backendSpecialties.length ? backendSpecialties : undefined,
    langs: backendLangs.length ? backendLangs : undefined,
    locations: selectedLocations.length ? selectedLocations : undefined,
    priceMin: minPrice > 0 ? minPrice : undefined,
    priceMax: maxPrice < 8000 ? maxPrice : undefined,
    sort: toBackendSort(uiSort),
    page: requestedPage,
    limit: CLINICS_PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(total / CLINICS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  const resultContext = [
    selectedLocations.length ? selectedLocations.join(", ") : "Seoul",
    selectedSpecialties.join(", "),
    selectedLanguages.join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* FILTERS SIDEBAR */}
        <ClinicsFilterPanel
          key={`${selectedSpecialties.join("|")}-${selectedLocations.join("|")}-${selectedLanguages.join("|")}-${minPrice}-${maxPrice}`}
          specialties={selectedSpecialties}
          languages={selectedLanguages}
          locations={selectedLocations}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        {/* RESULTS */}
        <main className="flex-1 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="text-sm text-brand-muted">
              <b className="text-brand-ink">{t("resultsCount", { count: total })}</b>
              {resultContext ? ` in ${resultContext}` : ""}
            </div>
            <ClinicsSort value={uiSort} />
          </div>

          {error ? (
            <div className="rounded-2xl border border-dashed border-brand-line bg-brand-cream/40 px-6 py-16 text-center">
              <h2 className="font-serif text-2xl font-semibold text-brand-teal-900">Couldn&apos;t load clinics</h2>
              <p className="mt-2 text-brand-muted">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {clinics.map((clinic, index) => (
                  <div
                    key={clinic._id}
                    className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-teal-500 hover:shadow-xl hover:shadow-brand-teal-900/10"
                  >
                    <div className={`relative h-64 bg-linear-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}`}>
                      <Link href={`/clinics/${clinic._id}`} className="absolute inset-0" aria-label={clinic.clinicName} />
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-teal-700">
                        ✦ {clinicBadgeKey(clinic) === "VERIFIED" ? t("verified") : clinicBadge(clinic)}
                      </span>
                      <LikeButton />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <Link href={`/clinics/${clinic._id}`} className="mb-2 block text-xl font-bold text-brand-ink hover:text-brand-teal-700">
                        {clinic.clinicName}
                      </Link>
                      <div className="mb-5 flex items-center gap-1.5 text-base text-brand-muted">
                        📍 {clinic.clinicAddress}
                      </div>
                      <div className="mb-7 flex flex-1 flex-wrap items-start gap-2">
                        {clinic.clinicSpecialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="rounded-full bg-brand-teal-100 px-3 py-1 text-sm font-semibold text-brand-teal-700"
                          >
                            {t(`specialty.${specialty}`)}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-brand-line pt-4">
                        <span className="flex items-center gap-1.5 text-lg font-bold text-brand-ink">
                          <span className="text-brand-gold">★</span> {clinic.clinicRating.toFixed(1)}
                          <span className="font-normal text-brand-muted">({clinic.clinicReviewCount})</span>
                        </span>
                        {clinic.startingPrice != null && (
                          <span className="text-base text-brand-muted">
                            {t("fromPrice", { price: clinic.startingPrice.toLocaleString() })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {clinics.length === 0 && (
                <div className="rounded-2xl border border-dashed border-brand-line bg-brand-cream/40 px-6 py-16 text-center">
                  <h2 className="font-serif text-2xl font-semibold text-brand-teal-900">{t("emptyState")}</h2>
                  <p className="mt-2 text-brand-muted">{t("emptyStateHint")}</p>
                </div>
              )}

              {clinics.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  query={{
                    specialties: selectedSpecialties.join(","),
                    locations: selectedLocations.join(","),
                    languages: selectedLanguages.join(","),
                    minPrice: minPrice > 0 ? String(minPrice) : "",
                    maxPrice: maxPrice < 8000 ? String(maxPrice) : "",
                    sort: uiSort === "top-rated" ? "" : uiSort,
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
