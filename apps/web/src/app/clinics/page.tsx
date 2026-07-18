"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { LikeButton } from "@/components/like-button";
import { Pagination } from "@/components/pagination";
import { ClinicsFilterPanel, ClinicsSort } from "@/components/clinics-filter-panel";
import { GET_CLINICS, type Clinic } from "@/lib/graphql/clinics";
import { toBackendSort } from "@/lib/clinic-sort";
import { toBackendSpecialties, toBackendLangs } from "@/lib/clinic-filters";

const CLINICS_PER_PAGE = 6;

const CARD_GRADIENTS = [
  "from-brand-teal-500 to-brand-teal-900",
  "from-brand-teal-700 to-brand-teal-900",
  "from-brand-teal-900 to-brand-teal-500",
  "from-brand-teal-500 to-brand-teal-700",
];

function parseList(value?: string | null) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function clampPrice(value: string | null, fallback: number) {
  // useSearchParams().get() returns null (not undefined) when the param is
  // absent, and Number(null) is 0 — not NaN — so it would silently pass the
  // isFinite check below and clamp to 0 instead of falling back. Must be
  // checked explicitly before the Number() conversion.
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(8000, Math.max(0, parsed)) : fallback;
}

function clinicBadge(clinic: Clinic) {
  if (clinic.clinicRating >= 4.9) return "Top Rated";
  if (clinic.clinicReviewCount >= 400) return "Patient Choice";
  if (clinic.clinicLangs.length > 1) return "International Friendly";
  return "Verified";
}

export default function ClinicsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ClinicsPageContent />
    </Suspense>
  );
}

function ClinicsPageContent() {
  const searchParams = useSearchParams();

  const selectedSpecialties = parseList(searchParams.get("specialties") ?? searchParams.get("treatment"));
  const selectedLocations = parseList(searchParams.get("locations") ?? searchParams.get("city"));
  const selectedLanguages = parseList(searchParams.get("languages") ?? searchParams.get("language"));
  const minPrice = clampPrice(searchParams.get("minPrice"), 0);
  const maxPrice = clampPrice(searchParams.get("maxPrice"), 8000);
  const uiSort = ["most-reviewed", "price-low", "price-high"].includes(searchParams.get("sort") ?? "")
    ? searchParams.get("sort")!
    : "top-rated";
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const backendSpecialties = toBackendSpecialties(selectedSpecialties);
  const backendLangs = toBackendLangs(selectedLanguages);

  const { data, loading, error } = useQuery(GET_CLINICS, {
    variables: {
      input: {
        specialties: backendSpecialties.length ? backendSpecialties : undefined,
        langs: backendLangs.length ? backendLangs : undefined,
        priceMin: minPrice > 0 ? minPrice : undefined,
        priceMax: maxPrice < 8000 ? maxPrice : undefined,
        sort: toBackendSort(uiSort),
        page: requestedPage,
        limit: CLINICS_PER_PAGE,
      },
    },
  });

  const clinics = data?.getClinics.list ?? [];
  const total = data?.getClinics.total ?? 0;
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
              <b className="text-brand-ink">{total} clinics</b>
              {resultContext ? ` in ${resultContext}` : ""}
            </div>
            <ClinicsSort value={uiSort} />
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: CLINICS_PER_PAGE }).map((_, index) => (
                <div key={index} className="h-105 animate-pulse rounded-xl border border-brand-line bg-brand-cream/60" />
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-dashed border-brand-line bg-brand-cream/40 px-6 py-16 text-center">
              <h2 className="font-serif text-2xl font-semibold text-brand-teal-900">Couldn&apos;t load clinics</h2>
              <p className="mt-2 text-brand-muted">{error.message}</p>
            </div>
          )}

          {!loading && !error && (
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
                        ✦ {clinicBadge(clinic)}
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
                            {specialty.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-brand-line pt-4">
                        <span className="flex items-center gap-1.5 text-lg font-bold text-brand-ink">
                          <span className="text-brand-gold">★</span> {clinic.clinicRating.toFixed(1)}
                          <span className="font-normal text-brand-muted">({clinic.clinicReviewCount})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {clinics.length === 0 && (
                <div className="rounded-2xl border border-dashed border-brand-line bg-brand-cream/40 px-6 py-16 text-center">
                  <h2 className="font-serif text-2xl font-semibold text-brand-teal-900">No clinics found</h2>
                  <p className="mt-2 text-brand-muted">Try changing one or more search options.</p>
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
