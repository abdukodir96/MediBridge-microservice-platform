import type { Metadata } from "next";
import { ClinicBookingRequestsScreen } from "@/components/clinic-booking-requests-screen";

export const metadata: Metadata = {
  title: "Booking Requests | My Clinic | MediBridge",
  description: "Review and manage every booking request sent to your clinic.",
};

export default function ClinicBookingRequestsPage() {
  return <ClinicBookingRequestsScreen />;
}
