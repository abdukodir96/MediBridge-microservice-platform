import type { Metadata } from "next";
import { DashboardScreen } from "@/components/dashboard-screen";

export const metadata: Metadata = {
  title: "My Page | MediBridge",
  description: "Manage your MediBridge treatment journey and bookings.",
};

export default function PatientDashboardPage() {
  return <DashboardScreen role="patient" />;
}
