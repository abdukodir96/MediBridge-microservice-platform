import type { Metadata } from "next";
import { PatientMessagesScreen } from "@/components/patient-messages-screen";

export const metadata: Metadata = {
  title: "Messages | My Page | MediBridge",
  description: "Chat with clinics about your MediBridge booking requests.",
};

export default function PatientMessagesPage() {
  return <PatientMessagesScreen />;
}
