"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { useProfileImage } from "@/components/use-profile-image";
import {
  CANCEL_BOOKING,
  COMPLETE_BOOKING,
  CONFIRM_BOOKING,
  GET_CLINIC_BOOKINGS,
  type BookingStatus,
  type ClinicBooking,
  type MemberCountry,
} from "@/lib/graphql/clinic-bookings";
import type { MemberLang } from "@/lib/graphql/clinics";

type BookingFilter = "ALL" | BookingStatus;

const filters: Array<{ value: BookingFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "REQUESTED", label: "New" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const avatarTones = [
  "from-brand-gold to-amber-700",
  "from-brand-teal-500 to-brand-teal-900",
  "from-amber-700 to-brand-gold",
  "from-brand-teal-700 to-brand-teal-900",
  "from-brand-teal-900 to-brand-teal-500",
];

const countryFlags: Record<MemberCountry, string> = {
  CHINA: "🇨🇳",
  JAPAN: "🇯🇵",
  USA: "🇺🇸",
  VIETNAM: "🇻🇳",
  THAILAND: "🇹🇭",
  OTHER: "",
};

const langLabels: Record<MemberLang, string> = {
  EN: "English",
  ZH: "中文",
  JA: "日本語",
  KO: "한국어",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function initialsFor(nick: string) {
  const parts = nick.trim().split(/\s+/);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : nick.slice(0, 2);
  return initials.toUpperCase();
}

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

function scheduleText(booking: ClinicBooking) {
  switch (booking.bookingStatus) {
    case "REQUESTED":
      return `prefers ${formatDate(booking.bookingPreferredDate)}`;
    case "CONFIRMED":
      return `confirmed for ${formatDate(booking.bookingConfirmedDate ?? booking.bookingPreferredDate)}`;
    case "PAID":
      return formatDate(booking.bookingPreferredDate);
    case "COMPLETED":
      return `completed ${formatDate(booking.bookingPreferredDate)}`;
    case "CANCELLED":
      return "request cancelled";
  }
}

export function ClinicBookingRequestsScreen() {
  const profileImage = useProfileImage();
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("ALL");

  // Fetches everything once (not filtered server-side by the active tab) so
  // every tab's count can be shown at the same time, matching the existing
  // design — filtering itself happens client-side below.
  const { data, loading, error } = useQuery(GET_CLINIC_BOOKINGS, {
    variables: { input: { limit: 50 } },
  });

  const [confirmBooking, { loading: confirming }] = useMutation(CONFIRM_BOOKING);
  const [cancelBooking, { loading: cancelling }] = useMutation(CANCEL_BOOKING);
  const [completeBooking, { loading: completing }] = useMutation(COMPLETE_BOOKING);
  const busy = confirming || cancelling || completing;

  const bookings = useMemo(() => data?.getClinicBookings.list ?? [], [data]);

  const counts = useMemo(() => {
    const result: Record<BookingFilter, number> = {
      ALL: bookings.length,
      REQUESTED: 0,
      CONFIRMED: 0,
      PAID: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    bookings.forEach((booking) => {
      result[booking.bookingStatus] += 1;
    });
    return result;
  }, [bookings]);

  const visibleBookings = useMemo(
    () =>
      activeFilter === "ALL"
        ? bookings
        : bookings.filter((booking) => booking.bookingStatus === activeFilter),
    [activeFilter, bookings],
  );

  const handleConfirm = async (booking: ClinicBooking) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Accept this booking?",
      text: `${money.format(booking.procedure.procedurePriceMin)} will be locked as the confirmed procedure price.`,
      showCancelButton: true,
      confirmButtonColor: "#125453",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Confirm",
    });
    if (!result.isConfirmed) return;

    try {
      await confirmBooking({ variables: { bookingId: booking._id } });
      await Swal.fire({
        icon: "success",
        title: "Booking updated",
        text: `${booking.patient.memberNick}'s booking is now confirmed.`,
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Couldn't confirm booking", text: (err as Error).message, confirmButtonColor: "#125453" });
    }
  };

  const handleDecline = async (booking: ClinicBooking, refund: boolean) => {
    const result = await Swal.fire({
      icon: "warning",
      title: refund ? "Cancel and refund?" : "Decline this request?",
      text: refund
        ? "The booking will be cancelled and the protected payment will be returned to the patient."
        : "The patient will be notified that the clinic declined the request.",
      showCancelButton: true,
      confirmButtonColor: "#125453",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Confirm",
    });
    if (!result.isConfirmed) return;

    try {
      await cancelBooking({ variables: { bookingId: booking._id } });
      await Swal.fire({
        icon: "success",
        title: "Booking updated",
        text: `${booking.patient.memberNick}'s booking is now cancelled.`,
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Couldn't cancel booking", text: (err as Error).message, confirmButtonColor: "#125453" });
    }
  };

  const handleComplete = async (booking: ClinicBooking) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Mark treatment complete?",
      text: "The patient will be asked to confirm that the treatment is complete.",
      showCancelButton: true,
      confirmButtonColor: "#125453",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Confirm",
    });
    if (!result.isConfirmed) return;

    try {
      await completeBooking({ variables: { bookingId: booking._id } });
      await Swal.fire({
        icon: "success",
        title: "Booking updated",
        text: `${booking.patient.memberNick}'s booking is now completed.`,
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Couldn't complete booking", text: (err as Error).message, confirmButtonColor: "#125453" });
    }
  };

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[760px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel="Booking requests"
        />

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <header>
            <h1 className="font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
              Booking requests
            </h1>
            <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
              All requests sent to your clinic, from first request to treatment.
            </p>
          </header>

          <div
            role="tablist"
            aria-label="Filter booking requests"
            className="mt-7 flex gap-2 overflow-x-auto pb-2"
          >
            {filters.map((filter) => {
              const selected = filter.value === activeFilter;
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`min-h-10 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold transition duration-200 ${
                    selected
                      ? "border-brand-teal-700 bg-brand-teal-700 text-white shadow-sm"
                      : "border-brand-line bg-white text-brand-muted hover:border-brand-teal-500 hover:text-brand-teal-700"
                  }`}
                >
                  {filter.label} ({counts[filter.value]})
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-8 flex min-h-[400px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
            </div>
          ) : error ? (
            <div className="mt-8 flex min-h-[400px] flex-col items-center justify-center gap-2 text-center">
              <p className="font-serif text-2xl font-semibold text-brand-teal-900">
                Couldn&apos;t load booking requests
              </p>
              <p className="max-w-md text-sm text-brand-muted">{error.message}</p>
            </div>
          ) : (
            <div
              className="mt-4 grid h-[1160px] gap-4 overflow-y-auto overscroll-contain pr-2 sm:h-[920px] [scrollbar-gutter:stable]"
              style={{ gridAutoRows: "calc((100% - 3rem) / 4)" }}
            >
              {visibleBookings.map((booking) => (
                <BookingRequestCard
                  key={booking._id}
                  booking={booking}
                  busy={busy}
                  onConfirm={() => handleConfirm(booking)}
                  onDecline={(refund) => handleDecline(booking, refund)}
                  onComplete={() => handleComplete(booking)}
                />
              ))}

              {visibleBookings.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-brand-line px-6 text-center">
                  <p className="font-serif text-2xl font-semibold text-brand-teal-900">
                    No bookings in this category
                  </p>
                  <p className="mt-2 text-sm text-brand-muted">
                    Booking requests will appear here when their status changes.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function BookingRequestCard({
  booking,
  busy,
  onConfirm,
  onDecline,
  onComplete,
}: {
  booking: ClinicBooking;
  busy: boolean;
  onConfirm: () => void;
  onDecline: (refund: boolean) => void;
  onComplete: () => void;
}) {
  const flag = booking.patient.memberCountry ? countryFlags[booking.patient.memberCountry] : "";
  const lang = langLabels[booking.patient.memberLang];

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-brand-line bg-white p-4 transition duration-200 hover:border-brand-teal-500 hover:shadow-lg sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${toneFor(booking._id)} text-xs font-bold text-white`}
          >
            {initialsFor(booking.patient.memberNick)}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-brand-ink">
              🧑 Patient · {booking.patient.memberNick} {flag}
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              {booking.procedure.procedureName} · {scheduleText(booking)}
              {lang ? ` · ${lang}` : ""}
            </p>
          </div>
        </div>
        <StatusPill status={booking.bookingStatus} />
      </div>

      {booking.bookingStatus === "REQUESTED" && (
        <>
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
            <span>Price to be locked in when accepted</span>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="font-serif text-lg text-brand-teal-900">
                {money.format(booking.procedure.procedurePriceMin)}
              </strong>
              <span className="rounded-md bg-brand-teal-100 px-2 py-1 text-[10px] font-bold text-brand-teal-700">
                AUTO · PROCEDURE MINIMUM
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="min-h-11 cursor-pointer rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              Accept &amp; confirm
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecline(false)}
              className="min-h-11 cursor-pointer rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Decline
            </button>
          </div>
        </>
      )}

      {booking.bookingStatus === "CONFIRMED" && (
        <div className="mt-4 border-t border-brand-line pt-4">
          <p className="text-sm text-brand-muted">
            Locked price{" "}
            <strong className="text-brand-ink">
              {money.format(booking.bookingAmount ?? 0)} 🔒
            </strong>
          </p>
          <p className="mt-3 text-sm italic text-brand-muted">
            Waiting for the patient to complete payment — no action is needed from you yet.
          </p>
        </div>
      )}

      {booking.bookingStatus === "PAID" && (
        <div className="mt-4 border-t border-brand-line pt-4">
          <p className="text-sm text-brand-muted">
            Paid <strong className="text-brand-ink">{money.format(booking.bookingAmount ?? 0)}</strong>
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onComplete}
              className="min-h-11 cursor-pointer rounded-xl bg-brand-gold px-5 text-sm font-bold text-brand-teal-900 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark treatment complete
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecline(true)}
              className="min-h-11 cursor-pointer rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel &amp; refund
            </button>
          </div>
        </div>
      )}

      {booking.bookingStatus === "COMPLETED" && (
        <p className="mt-4 border-t border-brand-line pt-4 text-sm italic text-brand-muted">
          ⏳ Escrow is held until the patient confirms treatment completion.
        </p>
      )}

      {booking.bookingStatus === "CANCELLED" && (
        <p className="mt-4 border-t border-brand-line pt-4 text-sm italic text-brand-muted">
          No payment is currently due for this cancelled booking.
        </p>
      )}
    </article>
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    REQUESTED: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-brand-teal-100 text-brand-teal-700",
    PAID: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-stone-100 text-stone-600",
    CANCELLED: "bg-red-50 text-red-600",
  };
  const labels: Record<BookingStatus, string> = {
    REQUESTED: "Requested",
    CONFIRMED: "Confirmed",
    PAID: "Paid · Escrow held",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return (
    <span
      className={`inline-flex self-start whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold uppercase ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
