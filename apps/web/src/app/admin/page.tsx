import type { Metadata } from "next";
import { AdminClinicReviewScreen } from "@/components/admin-clinic-review-screen";

export const metadata: Metadata = {
  title: "Clinic Review | MediBridge Admin",
  description: "Review new clinics before they appear to patients.",
};

export default function AdminReviewPage() {
  return <AdminClinicReviewScreen />;
}
