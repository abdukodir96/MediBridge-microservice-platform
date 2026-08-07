import type { Metadata } from "next";
import { AdminMessagesScreen } from "@/components/admin-messages-screen";

export const metadata: Metadata = {
  title: "Messages | MediBridge Admin",
  description: "Support conversations with clinics.",
};

export default function AdminMessagesPage() {
  return <AdminMessagesScreen />;
}
