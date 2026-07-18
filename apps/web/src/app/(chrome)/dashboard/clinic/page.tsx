import type { Metadata } from "next";
import { DashboardScreen } from "@/components/dashboard-screen";

export const metadata: Metadata = {
  title: "My Clinic | MediBridge",
  description: "Manage clinic booking requests, procedures, and reviews.",
};

export default function ClinicDashboardPage() {
  return <DashboardScreen role="clinic" />;
}
