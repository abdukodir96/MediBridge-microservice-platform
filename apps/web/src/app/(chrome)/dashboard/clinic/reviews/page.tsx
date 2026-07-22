import type { Metadata } from "next";
import { ClinicReviewsScreen } from "@/components/clinic-reviews-screen";

export const metadata: Metadata = {
  title: "Reviews | My Clinic | MediBridge",
  description: "See what patients are saying about your MediBridge clinic.",
};

export default async function ClinicReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Math.max(
    1,
    Number.parseInt(params.page ?? "1", 10) || 1,
  );
  return <ClinicReviewsScreen requestedPage={requestedPage} />;
}
