"use client";

import { Link, useRouter } from "@/lib/plain-navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  DashboardSidebar,
  patientNavigation,
} from "@/components/dashboard-screen";
import { useProfileImage } from "@/components/use-profile-image";
import { GET_MY_BOOKINGS } from "@/lib/graphql/bookings";
import { PAY_BOOKING } from "@/lib/graphql/payment";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PayBookingScreen({ bookingId }: { bookingId: string }) {
  const profileImage = useProfileImage();
  const router = useRouter();

  // Reuses the existing getMyBookings list rather than a dedicated
  // "get one booking" query — the booking is already fetched for My Page.
  const { data, loading, error } = useQuery(GET_MY_BOOKINGS, {
    variables: { input: { limit: 50 } },
  });
  const [payBooking, { loading: paying, error: payError }] = useMutation(PAY_BOOKING);

  const booking = data?.getMyBookings.list.find((item) => item._id === bookingId);

  const handlePay = async () => {
    try {
      await payBooking({ variables: { bookingId } });
      router.push("/dashboard/patient?paid=true");
    } catch {
      // surfaced below via payError
    }
  };

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[650px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="patient"
          navigation={patientNavigation}
          profileImage={profileImage}
          activeLabel="My Page"
        />

        <section className="flex min-w-0 flex-col px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
            </div>
          ) : error || !booking ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="font-serif text-2xl font-semibold text-brand-teal-900">
                Booking not found
              </p>
              <p className="max-w-md text-sm text-brand-muted">
                {error?.message ?? "This booking may not exist, or it isn't yours."}
              </p>
              <Link
                href="/dashboard/patient"
                className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white hover:bg-brand-teal-900"
              >
                Back to My Page
              </Link>
            </div>
          ) : booking.bookingStatus !== "CONFIRMED" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="font-serif text-2xl font-semibold text-brand-teal-900">
                This booking isn&apos;t ready for payment
              </p>
              <p className="max-w-md text-sm text-brand-muted">
                Only a confirmed booking can be paid. Its current status is{" "}
                <strong>{booking.bookingStatus}</strong>.
              </p>
              <Link
                href="/dashboard/patient"
                className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white hover:bg-brand-teal-900"
              >
                Back to My Page
              </Link>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-lg">
              <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                ✓ {booking.clinic.clinicName} confirmed your booking
              </div>

              <h1 className="mt-6 font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
                Secure payment
              </h1>
              <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
                Your money stays protected in escrow until treatment is complete.
              </p>

              <div className="mt-7 rounded-2xl border border-brand-line p-5 sm:p-7">
                <div className="flex items-center justify-between text-sm text-brand-muted">
                  <span>{booking.procedure.procedureName}</span>
                  <span>
                    {money.format(booking.bookingAmount ?? 0)} <span aria-hidden="true">🔒</span>
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-brand-line pt-4">
                  <strong className="text-brand-ink">Pay now</strong>
                  <strong className="font-serif text-2xl text-brand-teal-900">
                    {money.format(booking.bookingAmount ?? 0)}
                  </strong>
                </div>
              </div>

              {payError && (
                <p className="mt-4 text-sm text-red-600">{payError.message}</p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={paying}
                className="mt-7 min-h-14 w-full cursor-pointer rounded-xl bg-brand-teal-700 px-6 text-base font-bold text-white transition hover:bg-brand-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying ? "Processing..." : `🔒 Pay ${money.format(booking.bookingAmount ?? 0)} securely`}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
