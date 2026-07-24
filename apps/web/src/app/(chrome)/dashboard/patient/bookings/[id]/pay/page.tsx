import type { Metadata } from "next";
import { PayBookingScreen } from "@/components/pay-booking-screen";

export const metadata: Metadata = {
  title: "Pay for Booking | MediBridge",
  description: "Securely pay for your confirmed MediBridge booking.",
};

export default async function PayBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PayBookingScreen bookingId={id} />;
}
