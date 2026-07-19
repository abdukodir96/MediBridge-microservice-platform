import type { Metadata } from "next";
import { ClinicProceduresScreen } from "@/components/clinic-procedures-screen";

export const metadata: Metadata = {
  title: "Procedures | My Clinic | MediBridge",
  description: "Manage the procedures displayed on your MediBridge clinic profile.",
};

export default function ClinicProceduresPage() {
  return <ClinicProceduresScreen />;
}
