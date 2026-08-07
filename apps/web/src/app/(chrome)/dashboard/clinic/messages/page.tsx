import type { Metadata } from "next";
import { ClinicMessagesScreen } from "@/components/clinic-messages-screen";

export const metadata: Metadata = {
  title: "Messages | My Clinic | MediBridge",
  description: "Chat with patients about their MediBridge bookings.",
};

export default function ClinicMessagesPage() {
  return <ClinicMessagesScreen />;
}
