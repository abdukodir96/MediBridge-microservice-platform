"use client";

import Swal from "sweetalert2";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_CLINIC_STATUS_COUNTS,
  GET_CLINICS_FOR_ADMIN,
  UPDATE_CLINIC_STATUS,
  type AdminClinic,
} from "@/lib/graphql/admin";
import { langLabel, titleCaseEnum } from "@/lib/clinic-format";

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function AdminClinicReviewScreen() {
  const { data: countsData, loading: countsLoading, refetch: refetchCounts } = useQuery(
    GET_CLINIC_STATUS_COUNTS,
  );
  const { data, loading, error, refetch } = useQuery(GET_CLINICS_FOR_ADMIN, {
    variables: { input: { status: "PENDING", limit: 50 } },
  });
  const [updateClinicStatus, { loading: updating }] = useMutation(UPDATE_CLINIC_STATUS);

  const counts = countsData?.getClinicStatusCounts;
  const pendingClinics = data?.getClinicsForAdmin.list ?? [];

  const handleVerify = async (clinic: AdminClinic) => {
    const result = await Swal.fire({
      icon: "question",
      title: `Verify ${clinic.clinicName}?`,
      text: "This makes the clinic visible to patients immediately.",
      showCancelButton: true,
      confirmButtonColor: "#125453",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Verify",
    });
    if (!result.isConfirmed) return;

    try {
      await updateClinicStatus({ variables: { clinicId: clinic._id, status: "VERIFIED" } });
      await Promise.all([refetch(), refetchCounts()]);
      await Swal.fire({
        icon: "success",
        title: "Clinic verified",
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't verify clinic",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  const handleReject = async (clinic: AdminClinic) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Reject ${clinic.clinicName}?`,
      // There's no separate REJECTED status — a rejected clinic is marked
      // SUSPENDED (same "hidden from patients" outcome), and can be
      // reinstated later from the All Clinics screen if needed.
      text: "The clinic will stay hidden from patients. This can be reversed from All Clinics later.",
      showCancelButton: true,
      confirmButtonColor: "#c0574f",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Reject",
    });
    if (!result.isConfirmed) return;

    try {
      await updateClinicStatus({ variables: { clinicId: clinic._id, status: "SUSPENDED" } });
      await Promise.all([refetch(), refetchCounts()]);
      await Swal.fire({
        icon: "success",
        title: "Clinic rejected",
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't reject clinic",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold text-brand-teal-900">
        Clinic Review Queue
      </h1>
      <p className="mt-1 text-sm text-brand-muted">
        New clinics waiting for verification before they appear to patients.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatTile label="Pending review" value={counts?.pending} loading={countsLoading} tone="amber" />
        <StatTile label="Verified" value={counts?.verified} loading={countsLoading} />
        <StatTile label="Suspended" value={counts?.suspended} loading={countsLoading} />
        <StatTile label="Total clinics" value={counts?.total} loading={countsLoading} />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
          </div>
        ) : error ? (
          <p className="rounded-xl border border-dashed border-brand-line px-5 py-6 text-center text-sm text-brand-muted">
            Couldn&apos;t load the review queue — {error.message}
          </p>
        ) : pendingClinics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-line px-6 py-16 text-center">
            <p className="font-serif text-xl font-semibold text-brand-teal-900">
              Nothing to review
            </p>
            <p className="mt-2 text-sm text-brand-muted">
              All clinics have been reviewed. New submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClinics.map((clinic) => (
              <div key={clinic._id} className="rounded-2xl border border-brand-line p-4.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-bold text-brand-ink">{clinic.clinicName}</p>
                    <p className="mt-0.5 text-xs text-brand-muted">📍 {clinic.clinicAddress}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10.5px] font-bold text-amber-700">
                      PENDING
                    </span>
                    <p className="mt-1 text-[11px] text-brand-muted">Submitted {timeAgo(clinic.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {clinic.clinicSpecialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-brand-teal-100 px-2.5 py-1 text-[10.5px] font-semibold text-brand-teal-700"
                    >
                      {titleCaseEnum(specialty)}
                    </span>
                  ))}
                  {clinic.clinicLangs.length > 0 && (
                    <span className="rounded-full bg-brand-teal-100 px-2.5 py-1 text-[10.5px] font-semibold text-brand-teal-700">
                      {clinic.clinicLangs.map(langLabel).join(" · ")}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-[11.5px] text-brand-muted">
                  Owner: {clinic.owner.memberEmail}
                  {clinic.clinicLicenses.length === 0 && " · no licenses uploaded yet ⚠️"}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleVerify(clinic)}
                    className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ✓ Verify
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleReject(clinic)}
                    className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  loading,
  tone,
}: {
  label: string;
  value?: number;
  loading: boolean;
  tone?: "amber";
}) {
  return (
    <div className="rounded-xl border border-brand-line p-4">
      <p className="text-[11px] text-brand-muted">{label}</p>
      <p
        className={`mt-1.5 font-serif text-[22px] font-semibold ${
          tone === "amber" ? "text-amber-600" : "text-brand-teal-900"
        }`}
      >
        {loading ? "—" : value}
      </p>
    </div>
  );
}
