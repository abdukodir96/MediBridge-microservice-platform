"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { useMutation, useQuery } from "@apollo/client/react";
import { useProfileImage } from "@/components/use-profile-image";
import { useClinicProfile } from "@/components/clinic-profile-store";
import { GET_MY_BOOKINGS, type BookingStatus } from "@/lib/graphql/bookings";
import { CONFIRM_COMPLETION } from "@/lib/graphql/payment";

export type DashboardRole = "patient" | "clinic";

export type SidebarItem = {
  icon: string;
  label: string;
  href: string;
};

export const patientNavigation: SidebarItem[] = [
  { icon: "👤", label: "My Page", href: "/dashboard/patient" },
  { icon: "⌕", label: "Find clinics", href: "/clinics" },
  { icon: "💬", label: "Messages", href: "/dashboard/messages" },
];

export const clinicNavigation: SidebarItem[] = [
  { icon: "🏥", label: "My Clinic", href: "/dashboard/clinic" },
  { icon: "📥", label: "Booking requests", href: "/dashboard/clinic/booking-requests" },
  { icon: "🩺", label: "Procedures", href: "/dashboard/clinic/procedures" },
  { icon: "☆", label: "Reviews", href: "/dashboard/clinic/reviews" },
];

type DashboardStat = {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
};

const patientStats: DashboardStat[] = [
  { label: "Active bookings", value: "3", detail: "Requested + confirmed + paid" },
  { label: "In escrow", value: "$2,520", detail: "Protected treatment funds" },
  { label: "Completed", value: "1", detail: "Treatment completed" },
  { label: "Cancelled", value: "0", detail: "No cancellations" },
];

const clinicStats: DashboardStat[] = [
  { label: "New requests", value: "2", detail: "Needs your reply", accent: true },
  { label: "Active bookings", value: "4", detail: "Confirmed + paid" },
  { label: "Earnings (escrow)", value: "$9.9K", detail: "Paid + completed" },
  { label: "Rating", value: "4.9", detail: "312 patient reviews" },
];

const statusLabels: Record<BookingStatus, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  PAID: "Paid · Escrow held",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusTones: Record<BookingStatus, string> = {
  REQUESTED: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-brand-teal-100 text-brand-teal-700",
  PAID: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-stone-100 text-stone-600",
  CANCELLED: "bg-red-50 text-red-600",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatBookingDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const initialRequests = [
  {
    id: 1,
    patient: "Li Mei",
    country: "🇨🇳",
    detail: "Rhinoplasty · prefers Aug 12 · 中文",
    avatar: "LM",
  },
  {
    id: 2,
    patient: "Yuki Tanaka",
    country: "🇯🇵",
    detail: "Double eyelid · prefers Sep 3 · 日本語",
    avatar: "YT",
  },
];

function BookingSubmittedBanner() {
  const searchParams = useSearchParams();
  const justSubmitted = searchParams.get("submitted") === "true";

  if (!justSubmitted) return null;

  return (
    <div className="mb-6 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
      ✓ Your booking request was submitted. The clinic will review it and confirm shortly.
    </div>
  );
}

export function DashboardScreen({ role }: { role: DashboardRole }) {
  const isPatient = role === "patient";
  const navigation = isPatient ? patientNavigation : clinicNavigation;
  const stats = isPatient ? patientStats : clinicStats;
  const profileImage = useProfileImage();

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[650px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role={role}
          navigation={navigation}
          profileImage={profileImage}
          activeLabel={isPatient ? "My Page" : "My Clinic"}
        />

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {isPatient && (
            <Suspense fallback={null}>
              <BookingSubmittedBanner />
            </Suspense>
          )}

          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
                {isPatient ? "Welcome back, Wang 👋" : "Clinic overview"}
              </h1>
              <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
                {isPatient
                  ? "Here’s what’s happening with your treatment journey."
                  : "Seoul Line Clinic · Gangnam-gu, Seoul"}
              </p>
            </div>
            <Link
              href={isPatient ? "/clinics" : "/dashboard/clinic/procedures/new"}
              className="inline-flex min-h-11 items-center justify-center self-start rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-lg"
            >
              {isPatient ? "+ Find a clinic" : "+ Add procedure"}
            </Link>
          </header>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="min-h-[150px] rounded-xl border border-brand-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-medium text-brand-muted">{stat.label}</p>
                <strong className="mt-3 block font-serif text-[30px] font-semibold leading-none text-brand-teal-900">
                  {stat.value}
                </strong>
                <p
                  className={`mt-3 text-xs uppercase leading-5 ${
                    stat.accent ? "text-amber-600" : "text-brand-muted"
                  }`}
                >
                  {stat.detail}
                </p>
              </article>
            ))}
          </div>

          {isPatient ? <PatientBookings /> : <ClinicRequests />}
        </section>
      </div>
    </main>
  );
}

export function DashboardSidebar({
  role,
  navigation,
  profileImage,
  activeLabel,
  identityActive = false,
  identityName,
}: {
  role: DashboardRole;
  navigation: SidebarItem[];
  profileImage: string;
  activeLabel: string;
  identityActive?: boolean;
  // Real clinic name (from useClinic()), passed by screens that have it.
  // Falls back to the mock clinic-profile store where a caller hasn't been
  // wired to real data yet.
  identityName?: string;
}) {
  const isPatient = role === "patient";
  const { profile: clinicProfile } = useClinicProfile();
  const clinicIdentityName = (identityName ?? clinicProfile.name).replace(/\s+Clinic$/i, "");

  return (
    <aside className="flex border-b border-brand-line bg-[#fdfcf9] lg:min-h-full lg:flex-col lg:border-b-0 lg:border-r">
      <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto p-4 lg:block lg:space-y-2 lg:p-5">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-base font-semibold transition ${
              item.label === activeLabel
                ? "bg-brand-teal-100 text-brand-teal-700"
                : "text-brand-muted hover:bg-brand-cream hover:text-brand-teal-900"
            }`}
          >
            <span className={item.label === "Find clinics" ? "text-4xl" : "text-xl"} aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden border-t border-brand-line p-5 lg:block">
        <Link
          href={isPatient ? "/dashboard/profile" : "/dashboard/clinic/profile"}
          className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-brand-teal-100 ${
            identityActive ? "bg-brand-teal-100" : ""
          }`}
        >
          <Image
            src={profileImage}
            alt={isPatient ? "Wang Lei" : clinicIdentityName}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-brand-line object-cover"
          />
          <div>
            <p className="text-sm font-bold text-brand-ink">
              {isPatient ? "Wang Lei" : clinicIdentityName}
            </p>
            <p className="mt-0.5 text-xs text-brand-muted">
              {isPatient ? "Patient · 🇨🇳" : "Clinic · Top Rated"}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function PatientBookings() {
  const { data, loading, error } = useQuery(GET_MY_BOOKINGS, {
    variables: { input: { limit: 50 } },
  });
  const [confirmCompletion, { loading: confirming }] = useMutation(CONFIRM_COMPLETION);

  const bookings = data?.getMyBookings.list ?? [];

  const handleConfirmCompletion = async (bookingId: string) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Confirm treatment is complete?",
      text: "This releases the escrowed payment to the clinic.",
      showCancelButton: true,
      confirmButtonColor: "#125453",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Confirm & release",
    });
    if (!result.isConfirmed) return;

    try {
      await confirmCompletion({ variables: { bookingId } });
      await Swal.fire({
        icon: "success",
        title: "Payment released",
        text: "The clinic has been paid. Thank you!",
        confirmButtonColor: "#125453",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't release payment",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  return (
    <section className="mt-9" id="bookings">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-brand-ink">Upcoming bookings</h2>
      </div>

      {loading ? (
        <div className="flex min-h-[150px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-dashed border-brand-line px-5 py-6 text-center text-sm text-brand-muted">
          Couldn&apos;t load your bookings — {error.message}
        </p>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-line px-5 py-10 text-center text-sm text-brand-muted">
          No bookings yet. Find a clinic to get started.
        </div>
      ) : (
        <div className="max-h-[340px] space-y-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
          {bookings.map((booking) => (
            <article
              key={booking._id}
              className="flex flex-col gap-4 rounded-xl border border-brand-line p-4 transition hover:border-brand-teal-500 hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="h-14 w-14 shrink-0 rounded-xl bg-linear-to-br from-brand-teal-500 to-brand-teal-900" />
                <div className="min-w-0">
                  <p className="font-bold text-brand-ink">{booking.clinic.clinicName}</p>
                  <p className="mt-1 truncate text-sm text-brand-muted">
                    {booking.procedure.procedureName} ·{" "}
                    {booking.bookingStatus === "REQUESTED"
                      ? `prefers ${formatBookingDate(booking.bookingPreferredDate)}`
                      : formatBookingDate(booking.bookingConfirmedDate ?? booking.bookingPreferredDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold uppercase ${statusTones[booking.bookingStatus]}`}
                >
                  {statusLabels[booking.bookingStatus]}
                </span>
                {booking.bookingAmount != null && (
                  <p className="mt-2 font-bold text-brand-teal-900">{money.format(booking.bookingAmount)}</p>
                )}
                {booking.bookingStatus === "CONFIRMED" && (
                  <Link
                    href={`/dashboard/patient/bookings/${booking._id}/pay`}
                    className="mt-2 inline-flex min-h-9 items-center rounded-lg bg-brand-teal-700 px-4 text-xs font-bold text-white transition hover:bg-brand-teal-900"
                  >
                    Pay now →
                  </Link>
                )}
                {booking.bookingStatus === "COMPLETED" && (
                  <button
                    type="button"
                    disabled={confirming}
                    onClick={() => handleConfirmCompletion(booking._id)}
                    className="mt-2 inline-flex min-h-9 cursor-pointer items-center rounded-lg bg-brand-gold px-4 text-xs font-bold text-brand-teal-900 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ✓ Confirm & release payment
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ClinicRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [message, setMessage] = useState("");

  const resolveRequest = (id: number, action: "accepted" | "declined") => {
    const request = requests.find((item) => item.id === id);
    if (!request) return;
    setRequests((current) => current.filter((item) => item.id !== id));
    setMessage(`${request.patient}’s request was ${action}.`);
  };

  return (
    <section className="mt-9" id="requests">
      <h2 className="mb-4 text-lg font-bold text-brand-ink">New booking requests</h2>

      {message && (
        <p
          role="status"
          className="mb-3 rounded-xl bg-brand-teal-100 px-4 py-3 text-sm font-medium text-brand-teal-700"
        >
          {message}
        </p>
      )}

      <div className="max-h-[360px] space-y-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
        {requests.map((request) => (
          <article
            key={request.id}
            className="flex flex-col gap-4 rounded-xl border border-brand-line p-4 transition hover:border-brand-teal-500 hover:shadow-md xl:flex-row xl:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-gold to-amber-700 text-xs font-bold text-white">
                {request.avatar}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-brand-ink">
                  🧑 Patient · {request.patient} · {request.country}
                </p>
                <p className="mt-1 truncate text-sm text-brand-muted">{request.detail}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => resolveRequest(request.id, "declined")}
                className="min-h-11 rounded-xl border border-brand-line px-5 text-sm font-semibold text-brand-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => resolveRequest(request.id, "accepted")}
                className="min-h-11 rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white transition hover:bg-brand-teal-900"
              >
                Accept &amp; confirm
              </button>
            </div>
          </article>
        ))}

        {requests.length === 0 && (
          <div className="rounded-xl border border-dashed border-brand-line px-5 py-10 text-center text-sm text-brand-muted">
            All new booking requests have been reviewed.
          </div>
        )}
      </div>
    </section>
  );
}
