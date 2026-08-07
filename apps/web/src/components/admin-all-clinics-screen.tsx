"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_CLINIC_STATUS_COUNTS,
  GET_CLINICS_FOR_ADMIN,
  UPDATE_CLINIC_STATUS,
  type AdminClinic,
  type ClinicStatus,
} from "@/lib/graphql/admin";

type TabValue = "ALL" | ClinicStatus;

const statusPillClass: Record<ClinicStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-brand-teal-100 text-brand-teal-700",
  SUSPENDED: "bg-red-50 text-red-600",
};

export function AdminAllClinicsScreen() {
  const [tab, setTab] = useState<TabValue>("ALL");
  const { data: countsData } = useQuery(GET_CLINIC_STATUS_COUNTS);
  const { data, loading, error, refetch } = useQuery(GET_CLINICS_FOR_ADMIN, {
    variables: { input: { status: tab === "ALL" ? undefined : tab, limit: 50 } },
  });
  const [updateClinicStatus, { loading: updating }] = useMutation(UPDATE_CLINIC_STATUS);

  const counts = countsData?.getClinicStatusCounts;
  const clinics = data?.getClinicsForAdmin.list ?? [];

  const tabs: Array<{ value: TabValue; label: string; count?: number }> = [
    { value: "ALL", label: "All", count: counts?.total },
    { value: "PENDING", label: "Pending", count: counts?.pending },
    { value: "VERIFIED", label: "Verified", count: counts?.verified },
    { value: "SUSPENDED", label: "Suspended", count: counts?.suspended },
  ];

  const handleSuspend = async (clinic: AdminClinic) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Suspend ${clinic.clinicName}?`,
      text: "The clinic will be hidden from patients immediately.",
      showCancelButton: true,
      confirmButtonColor: "#c0574f",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Suspend",
    });
    if (!result.isConfirmed) return;

    try {
      await updateClinicStatus({ variables: { clinicId: clinic._id, status: "SUSPENDED" } });
      await refetch();
      await Swal.fire({
        icon: "success",
        title: "Clinic suspended",
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't suspend clinic",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  const handleReinstate = async (clinic: AdminClinic) => {
    try {
      await updateClinicStatus({ variables: { clinicId: clinic._id, status: "VERIFIED" } });
      await refetch();
      await Swal.fire({
        icon: "success",
        title: "Clinic reinstated",
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't reinstate clinic",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold text-brand-teal-900">All Clinics</h1>
      <p className="mt-1 text-sm text-brand-muted">Every clinic on the platform, regardless of status.</p>

      <div className="mt-6 flex gap-1.5">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition ${
              tab === item.value
                ? "border-brand-teal-900 bg-brand-teal-900 text-white"
                : "border-brand-line text-brand-muted hover:bg-brand-cream"
            }`}
          >
            {item.label} ({item.count ?? "—"})
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
          </div>
        ) : error ? (
          <p className="rounded-xl border border-dashed border-brand-line px-5 py-6 text-center text-sm text-brand-muted">
            Couldn&apos;t load clinics — {error.message}
          </p>
        ) : clinics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-line px-6 py-16 text-center text-sm text-brand-muted">
            No clinics in this category.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-brand-line px-3 py-2.5 text-left text-[11px] font-semibold text-brand-muted">
                  Clinic
                </th>
                <th className="border-b border-brand-line px-3 py-2.5 text-left text-[11px] font-semibold text-brand-muted">
                  Owner
                </th>
                <th className="border-b border-brand-line px-3 py-2.5 text-left text-[11px] font-semibold text-brand-muted">
                  Status
                </th>
                <th className="border-b border-brand-line px-3 py-2.5 text-left text-[11px] font-semibold text-brand-muted">
                  Rating
                </th>
                <th className="border-b border-brand-line px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => (
                <tr key={clinic._id}>
                  <td className="border-b border-brand-line px-3 py-3 text-sm font-semibold text-brand-ink">
                    {clinic.clinicName}
                  </td>
                  <td className="border-b border-brand-line px-3 py-3 text-xs text-brand-muted">
                    {clinic.owner.memberEmail}
                  </td>
                  <td className="border-b border-brand-line px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-bold ${statusPillClass[clinic.clinicStatus]}`}
                    >
                      {clinic.clinicStatus}
                    </span>
                  </td>
                  <td className="border-b border-brand-line px-3 py-3 text-sm text-brand-ink">
                    {clinic.clinicReviewCount > 0
                      ? `${clinic.clinicRating.toFixed(1)} (${clinic.clinicReviewCount})`
                      : "—"}
                  </td>
                  <td className="border-b border-brand-line px-3 py-3">
                    <div className="flex justify-end gap-1.5">
                      {clinic.clinicStatus === "VERIFIED" && (
                        <>
                          <Link
                            href={`/clinics/${clinic._id}`}
                            target="_blank"
                            className="rounded-md border border-brand-teal-100 bg-brand-teal-100 px-2.5 py-1.5 text-[11px] font-semibold text-brand-teal-700"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() => handleSuspend(clinic)}
                            className="cursor-pointer rounded-md border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Suspend
                          </button>
                        </>
                      )}
                      {clinic.clinicStatus === "SUSPENDED" && (
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => handleReinstate(clinic)}
                          className="cursor-pointer rounded-md border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reinstate
                        </button>
                      )}
                      {clinic.clinicStatus === "PENDING" && (
                        <Link
                          href="/admin"
                          className="rounded-md border border-brand-teal-100 bg-brand-teal-100 px-2.5 py-1.5 text-[11px] font-semibold text-brand-teal-700"
                        >
                          Review
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
