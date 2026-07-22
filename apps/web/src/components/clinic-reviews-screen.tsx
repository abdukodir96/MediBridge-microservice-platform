"use client";

import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { Pagination } from "@/components/pagination";
import { useProfileImage } from "@/components/use-profile-image";

type Review = {
  id: number;
  patient: string;
  country: string;
  date: string;
  rating: number;
  text: string;
  procedure: string;
  avatarTone: string;
};

const ratingDistribution = [
  { stars: 5, count: 274, percentage: 88 },
  { stars: 4, count: 25, percentage: 8 },
  { stars: 3, count: 9, percentage: 3 },
  { stars: 2, count: 3, percentage: 1 },
  { stars: 1, count: 1, percentage: 0.3 },
];

const reviewTemplates = [
  {
    patient: "Wang L.",
    country: "🇨🇳",
    rating: 5,
    text: "The coordinator spoke perfect Chinese and translated everything during my consultation. The escrow payment made me feel safe sending money before arriving. Very happy with my rhinoplasty result.",
    procedure: "Rhinoplasty",
    avatarTone: "from-brand-gold to-amber-700",
  },
  {
    patient: "Yuki T.",
    country: "🇯🇵",
    rating: 5,
    text: "Booking through MediBridge was much easier than contacting the clinic directly. Everything was clear and I could chat with the clinic before deciding.",
    procedure: "Double Eyelid Surgery",
    avatarTone: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    patient: "Linh N.",
    country: "🇻🇳",
    rating: 4,
    text: "Good result overall. Recovery took a little longer than expected, but the clinic followed up regularly and answered every question.",
    procedure: "V-line Face Contouring",
    avatarTone: "from-amber-700 to-brand-gold",
  },
  {
    patient: "Emma R.",
    country: "🇺🇸",
    rating: 5,
    text: "The clinic explained the treatment plan and pricing clearly. The English-speaking coordinator made the entire visit feel organized and comfortable.",
    procedure: "Skin Treatment",
    avatarTone: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    patient: "Aziza K.",
    country: "🇺🇿",
    rating: 5,
    text: "I received quick answers before travelling and the clinic arranged every appointment on time. The aftercare instructions were especially helpful.",
    procedure: "Rhinoplasty",
    avatarTone: "from-brand-gold to-brand-teal-700",
  },
  {
    patient: "Minh P.",
    country: "🇻🇳",
    rating: 4,
    text: "Professional team and a clean clinic. I appreciated the regular recovery check-ins after returning home.",
    procedure: "Double Eyelid Surgery",
    avatarTone: "from-brand-teal-500 to-cyan-800",
  },
];

const dates = [
  "2 days ago",
  "1 week ago",
  "3 weeks ago",
  "1 month ago",
  "2 months ago",
  "3 months ago",
];

const reviews: Review[] = Array.from({ length: 18 }, (_, index) => {
  const template = reviewTemplates[index % reviewTemplates.length];
  return {
    ...template,
    id: index + 1,
    date: dates[index % dates.length],
  };
});

const REVIEWS_PER_PAGE = 3;

export function ClinicReviewsScreen({ requestedPage }: { requestedPage: number }) {
  const profileImage = useProfileImage();
  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const pageReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE,
  );

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[790px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel="Reviews"
        />

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <header>
            <h1 className="font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
              Reviews
            </h1>
            <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
              What patients are saying about Seoul Line Clinic.
            </p>
          </header>

          <section
            aria-label="Clinic rating summary"
            className="mt-7 flex flex-col gap-6 rounded-2xl border border-brand-line bg-white p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-7"
          >
            <div className="border-b border-brand-line pb-5 text-center sm:min-w-[165px] sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
              <strong className="block font-serif text-5xl font-semibold leading-none text-brand-teal-900">
                4.9
              </strong>
              <StarRating rating={5} />
              <p className="mt-1 text-sm text-brand-muted">312 reviews</p>
            </div>

            <div className="flex-1 space-y-2.5">
              {ratingDistribution.map((row) => (
                <div
                  key={row.stars}
                  className="grid grid-cols-[42px_minmax(0,1fr)_38px] items-center gap-3 text-xs text-brand-muted"
                >
                  <span>{row.stars} ★</span>
                  <span className="h-2 overflow-hidden rounded-full bg-brand-line">
                    <span
                      className="block h-full rounded-full bg-brand-gold"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </span>
                  <span className="text-right">{row.count}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 space-y-3">
            {pageReviews.map((review) => (
              <article
                key={review.id}
                className="min-h-[160px] rounded-2xl border border-brand-line bg-white p-4 transition duration-200 hover:border-brand-teal-500 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${review.avatarTone} text-xs font-bold text-white`}
                    >
                      {review.patient
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-brand-ink">
                        {review.patient} · {review.country}
                      </h2>
                      <p className="mt-0.5 text-xs text-brand-muted">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} compact />
                </div>

                <p className="mt-3 text-sm leading-6 text-brand-ink">
                  {review.text}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-brand-teal-100 px-3 py-1 text-xs font-semibold text-brand-teal-700">
                  {review.procedure}
                </span>
              </article>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/dashboard/clinic/reviews"
            ariaLabel="Reviews pagination"
          />
        </section>
      </div>
    </main>
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
