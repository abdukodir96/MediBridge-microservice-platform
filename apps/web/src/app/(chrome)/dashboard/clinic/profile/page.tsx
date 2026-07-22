import type { Metadata } from "next";
import { ClinicProfileSettingsScreen } from "@/components/clinic-profile-settings-screen";

export const metadata: Metadata = {
  title: "Clinic Profile Settings | My Clinic | MediBridge",
  description: "Manage the public information shown on your MediBridge clinic profile.",
};

export default function ClinicProfileSettingsPage() {
  return <ClinicProfileSettingsScreen />;
}
