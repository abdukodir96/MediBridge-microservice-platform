"use client";

import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { Pagination } from "@/components/pagination";
import { useProfileImage } from "@/components/use-profile-image";
import { useClinic } from "@/context/clinic-context";
import { useQuery } from "@apollo/client/react";
import {
  GET_REVIEWS_BY_CLINIC,
  type ClinicReview,
  type MemberCountry,
} from "@/lib/graphql/reviews";

const REVIEWS_PER_PAGE = 3;

const countryFlags: Record<MemberCountry, string> = {
  CHINA: "🇨🇳",
  JAPAN: "🇯🇵",
  USA: "🇺🇸",
  VIETNAM: "🇻🇳",
  THAILAND: "🇹🇭",
  OTHER: "",
};

const avatarTones = [
  "from-brand-gold to-amber-700",
  "from-brand-teal-500 to-brand-teal-900",
  "from-amber-700 to-brand-gold",
  "from-brand-teal-700 to-brand-teal-900",
  "from-brand-gold to-brand-teal-700",
  "from-brand-teal-500 to-cyan-800",
];

function toneFor(id: string) {
  const hash = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarTones[hash % avatarTones.length];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClinicReviewsScreen({ requestedPage }: { requestedPage: number }) {
  const profileImage = useProfileImage();
  const { clinic } = useClinic();

  const { data, loading, error } = useQuery(GET_REVIEWS_BY_CLINIC, {
    variables: { clinicId: clinic._id, input: { page: requestedPage, limit: REVIEWS_PER_PAGE } },
  });

  // getReviewsByClinic filters to VERIFIED clinics (same visibility rule as
  // getClinic/getProceduresByClinic), so a not-yet-verified clinic's own
  // Reviews page would otherwise show a raw "Clinic not found" error — but a
  // PENDING clinic structurally can't have reviews yet (no patient can find
  // or book it), so treat that specific case as "no reviews" instead of an
  // error, rather than adding an owner-scoped getMyReviews query for it.
  const isNotYetVerified = Boolean(error) && clinic.clinicStatus !== "VERIFIED";

  const reviews = isNotYetVerified ? [] : data?.getReviewsByClinic.list ?? [];
  const total = isNotYetVerified ? 0 : data?.getReviewsByClinic.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[790px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel="Reviews"
          identityName={clinic.clinicName}
        />

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <header>
            <h1 className="font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
              Reviews
            </h1>
            <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
              What patients are saying about {clinic.clinicName}.
            </p>
          </header>

          <section
            aria-label="Clinic rating summary"
            className="mt-7 flex items-center gap-6 rounded-2xl border border-brand-line bg-white p-5 sm:gap-8 sm:p-7"
          >
            <div className="text-center">
              <strong className="block font-serif text-5xl font-semibold leading-none text-brand-teal-900">
                {clinic.clinicRating.toFixed(1)}
              </strong>
              <StarRating rating={Math.round(clinic.clinicRating)} />
              <p className="mt-1 text-sm text-brand-muted">
                {clinic.clinicReviewCount} {clinic.clinicReviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
          </section>

          {loading ? (
            <div className="mt-8 flex min-h-[300px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
            </div>
          ) : error && !isNotYetVerified ? (
            <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
              <p className="font-serif text-2xl font-semibold text-brand-teal-900">
                Couldn&apos;t load reviews
              </p>
              <p className="max-w-md text-sm text-brand-muted">{error.message}</p>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}

                {reviews.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-brand-line px-6 py-16 text-center">
                    <p className="font-serif text-2xl font-semibold text-brand-teal-900">
                      No reviews yet
                    </p>
                    <p className="mt-2 text-sm text-brand-muted">
                      Reviews from patients will appear here after their treatment is complete.
                    </p>
                  </div>
                )}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/dashboard/clinic/reviews"
                ariaLabel="Reviews pagination"
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ReviewCard({ review }: { review: ClinicReview }) {
  const flag = review.patient.memberCountry ? countryFlags[review.patient.memberCountry] : "";

  return (
    <article className="min-h-[160px] rounded-2xl border border-brand-line bg-white p-4 transition duration-200 hover:border-brand-teal-500 hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${toneFor(review._id)} text-xs font-bold text-white`}
          >
            {review.patient.memberNick.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h2 className="text-sm font-bold text-brand-ink">
              {review.patient.memberNick} {flag}
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.reviewRating} compact />
      </div>

      {review.reviewText && (
        <p className="mt-3 text-sm leading-6 text-brand-ink">{review.reviewText}</p>
      )}
    </article>
  );
}

function StarRating({
  rating,
  compact = false,
}: {
  rating: number;
  compact?: boolean;
}) {
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      className={`inline-flex gap-0.5 ${compact ? "text-sm" : "mt-2 text-base"}`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < rating ? "text-brand-gold" : "text-brand-line"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}
