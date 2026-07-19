"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { useProfileImage } from "@/components/use-profile-image";

type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED";

type BookingFilter = "ALL" | BookingStatus;

type ClinicBooking = {
  id: number;
  patient: string;
  avatar: string;
  avatarTone: string;
  country?: string;
  procedure: string;
  schedule: string;
  language?: string;
  status: BookingStatus;
  amount?: number;
};

const initialBookings: ClinicBooking[] = [
  {
    id: 1,
    patient: "Li Mei",
    avatar: "LM",
    avatarTone: "from-brand-gold to-amber-700",
    country: "🇨🇳",
    procedure: "Rhinoplasty",
    schedule: "prefers Aug 12, 2026",
    language: "中文",
    status: "REQUESTED",
    amount: 2400,
  },
  {
    id: 2,
    patient: "Yuki Tanaka",
    avatar: "YT",
    avatarTone: "from-brand-teal-500 to-brand-teal-900",
    country: "🇯🇵",
    procedure: "Double Eyelid",
    schedule: "prefers Sep 3, 2026",
    language: "日本語",
    status: "REQUESTED",
    amount: 1200,
  },
  {
    id: 3,
    patient: "Chen H.",
    avatar: "CH",
    avatarTone: "from-amber-700 to-brand-gold",
    procedure: "V-line Contour",
    schedule: "confirmed for Aug 20, 2026",
    status: "CONFIRMED",
    amount: 5600,
  },
  {
    id: 4,
    patient: "Park J.",
    avatar: "PK",
    avatarTone: "from-brand-teal-700 to-brand-teal-900",
    procedure: "Rhinoplasty",
    schedule: "Jul 28, 2026",
    status: "PAID",
    amount: 2600,
  },
  {
    id: 5,
    patient: "Song W.",
    avatar: "SW",
    avatarTone: "from-brand-teal-900 to-brand-teal-500",
    procedure: "Double Eyelid",
    schedule: "completed Jun 2, 2026",
    status: "COMPLETED",
    amount: 1200,
  },
  {
    id: 6,
    patient: "Patient",
    avatar: "?",
    avatarTone: "from-stone-300 to-stone-500",
    procedure: "Skin treatment",
    schedule: "request cancelled",
    status: "CANCELLED",
  },
];

const filters: Array<{ value: BookingFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "REQUESTED", label: "New" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ClinicBookingRequestsScreen() {
  const profileImage = useProfileImage();
  const [bookings, setBookings] = useState(initialBookings);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("ALL");

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
      result[booking.status] += 1;
    });
    return result;
  }, [bookings]);

  const visibleBookings = useMemo(
    () =>
      activeFilter === "ALL"
        ? bookings
        : bookings.filter((booking) => booking.status === activeFilter),
    [activeFilter, bookings],
  );

  const changeStatus = async (
    booking: ClinicBooking,
    nextStatus: BookingStatus,
    title: string,
    description: string,
  ) => {
    const result = await Swal.fire({
      icon: nextStatus === "CANCELLED" ? "warning" : "question",
      title,
      text: description,
      showCancelButton: true,
      confirmButtonColor: "#125453",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Confirm",
    });

    if (!result.isConfirmed) return;

    setBookings((current) =>
      current.map((item) =>
        item.id === booking.id ? { ...item, status: nextStatus } : item,
      ),
    );

    await Swal.fire({
      icon: "success",
      title: "Booking updated",
      text: `${booking.patient}’s booking is now ${nextStatus.toLowerCase()}.`,
      confirmButtonColor: "#125453",
      timer: 1500,
      showConfirmButton: false,
    });
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

          <div
            className="mt-4 grid h-[1160px] gap-4 overflow-y-auto overscroll-contain pr-2 sm:h-[920px] [scrollbar-gutter:stable]"
            style={{ gridAutoRows: "calc((100% - 3rem) / 4)" }}
          >
            {visibleBookings.map((booking) => (
              <BookingRequestCard
                key={booking.id}
                booking={booking}
                onChangeStatus={changeStatus}
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
        </section>
      </div>
    </main>
  );
}

function BookingRequestCard({
  booking,
  onChangeStatus,
}: {
  booking: ClinicBooking;
  onChangeStatus: (
    booking: ClinicBooking,
    nextStatus: BookingStatus,
    title: string,
    description: string,
  ) => Promise<void>;
}) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-brand-line bg-white p-4 transition duration-200 hover:border-brand-teal-500 hover:shadow-lg sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${booking.avatarTone} text-xs font-bold text-white`}
          >
            {booking.avatar}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-brand-ink">
              🧑 Patient · {booking.patient} {booking.country ?? ""}
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              {booking.procedure} · {booking.schedule}
              {booking.language ? ` · ${booking.language}` : ""}
            </p>
          </div>
        </div>
        <StatusPill status={booking.status} />
      </div>

      {booking.status === "REQUESTED" && booking.amount && (
        <>
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
            <span>Price to be locked in when accepted</span>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="font-serif text-lg text-brand-teal-900">
                {money.format(booking.amount)}
              </strong>
              <span className="rounded-md bg-brand-teal-100 px-2 py-1 text-[10px] font-bold text-brand-teal-700">
                AUTO · PROCEDURE MINIMUM
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                onChangeStatus(
                  booking,
                  "CONFIRMED",
                  "Accept this booking?",
                  `${money.format(booking.amount ?? 0)} will be locked as the confirmed procedure price.`,
                )
              }
              className="min-h-11 cursor-pointer rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-md"
            >
              Accept &amp; confirm
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeStatus(
                  booking,
                  "CANCELLED",
                  "Decline this request?",
                  "The patient will be notified that the clinic declined the request.",
                )
              }
              className="min-h-11 cursor-pointer rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Decline
            </button>
          </div>
        </>
      )}

      {booking.status === "CONFIRMED" && (
        <div className="mt-4 border-t border-brand-line pt-4">
          <p className="text-sm text-brand-muted">
            Locked price{" "}
            <strong className="text-brand-ink">
              {money.format(booking.amount ?? 0)} 🔒
            </strong>
          </p>
          <p className="mt-3 text-sm italic text-brand-muted">
            Waiting for the patient to complete payment — no action is needed from you yet.
          </p>
        </div>
      )}

      {booking.status === "PAID" && (
        <div className="mt-4 border-t border-brand-line pt-4">
          <p className="text-sm text-brand-muted">
            Paid <strong className="text-brand-ink">{money.format(booking.amount ?? 0)}</strong>
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                onChangeStatus(
                  booking,
                  "COMPLETED",
                  "Mark treatment complete?",
                  "The patient will be asked to confirm that the treatment is complete.",
                )
              }
              className="min-h-11 cursor-pointer rounded-xl bg-brand-gold px-5 text-sm font-bold text-brand-teal-900 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Mark treatment complete
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeStatus(
                  booking,
                  "CANCELLED",
                  "Cancel and refund?",
                  "The booking will be cancelled and the protected payment will be returned to the patient.",
                )
              }
              className="min-h-11 cursor-pointer rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Cancel &amp; refund
            </button>
          </div>
        </div>
      )}

      {booking.status === "COMPLETED" && (
        <p className="mt-4 border-t border-brand-line pt-4 text-sm italic text-brand-muted">
          ⏳ Escrow is held until the patient confirms treatment completion.
        </p>
      )}

      {booking.status === "CANCELLED" && (
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
