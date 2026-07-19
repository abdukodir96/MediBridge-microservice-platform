import type { Metadata } from "next";
import { PatientProfileScreen } from "@/components/patient-profile-screen";

export const metadata: Metadata = {
  title: "Profile Settings | My Page | MediBridge",
  description: "Manage your MediBridge patient profile and preferences.",
};

export default function PatientProfilePage() {
  return <PatientProfileScreen />;
}
