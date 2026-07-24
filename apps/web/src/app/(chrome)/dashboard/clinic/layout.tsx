"use client";

import { useQuery } from "@apollo/client/react";
import { GET_MY_CLINIC } from "@/lib/graphql/my-clinic";
import { ClinicProvider } from "@/context/clinic-context";

export default function ClinicDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data, loading, error } = useQuery(GET_MY_CLINIC);

  if (loading) {
    return (
      <div className="flex min-h-[650px] items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
      </div>
    );
  }

  if (error) {
    const notCreatedYet = error.message.includes("have not created");

    if (notCreatedYet) {
      return (
        <div className="flex min-h-[650px] flex-col items-center justify-center gap-2 bg-white px-6 text-center">
          <p className="font-serif text-2xl font-semibold text-brand-teal-900">
            You haven&apos;t created a clinic yet
          </p>
          <p className="max-w-md text-sm text-brand-muted">
            Once your clinic is registered, this is where you&apos;ll manage procedures,
            booking requests, and your public profile.
          </p>
        </div>
      );
    }

    return (
      <div className="flex min-h-[650px] flex-col items-center justify-center gap-2 bg-white px-6 text-center">
        <p className="font-serif text-2xl font-semibold text-brand-teal-900">
          Couldn&apos;t load your clinic
        </p>
        <p className="max-w-md text-sm text-brand-muted">{error.message}</p>
      </div>
    );
  }

  const clinic = data!.getMyClinic;

  return (
    <ClinicProvider value={{ clinic, clinicId: clinic._id }}>
      {clinic.clinicStatus === "PENDING" && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm font-semibold text-amber-800 sm:px-10">
          ⏳ Your clinic is awaiting verification. Some patient-facing features are hidden until an admin approves it.
        </div>
      )}
      {children}
    </ClinicProvider>
  );
}
