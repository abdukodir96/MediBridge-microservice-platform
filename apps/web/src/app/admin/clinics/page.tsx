import type { Metadata } from "next";
import { AdminAllClinicsScreen } from "@/components/admin-all-clinics-screen";

export const metadata: Metadata = {
  title: "All Clinics | MediBridge Admin",
  description: "Every clinic on the MediBridge platform, regardless of status.",
};

export default function AdminAllClinicsPage() {
  return <AdminAllClinicsScreen />;
}
