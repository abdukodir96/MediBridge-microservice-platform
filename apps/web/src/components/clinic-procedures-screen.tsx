"use client";

import Link from "next/link";
import Swal from "sweetalert2";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { useProfileImage } from "@/components/use-profile-image";
import {
  DELETE_PROCEDURE,
  GET_MY_PROCEDURES,
  type Procedure,
} from "@/lib/graphql/procedures";

const thumbnailTones = [
  "from-brand-teal-500 to-brand-teal-900",
  "from-brand-teal-700 to-brand-teal-900",
  "from-brand-teal-500 to-brand-teal-700",
  "from-brand-gold to-amber-700",
];

export function ClinicProceduresScreen() {
  const profileImage = useProfileImage();
  // cache-and-network (not the default cache-first): this list page fully
  // remounts on every client-side navigation back to it (it's a leaf route,
  // not part of the persistent clinic-dashboard layout), so without this a
  // create/edit/delete done on another page would show stale cached results
  // until a hard refresh.
  const { data, loading, error, refetch } = useQuery(GET_MY_PROCEDURES, {
    fetchPolicy: "cache-and-network",
  });
  const [deleteProcedure] = useMutation(DELETE_PROCEDURE);

  const removeProcedure = async (procedure: Procedure) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: `Do you really want to delete ${procedure.procedureName}? It will no longer be visible to patients.`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#c0574f",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      await deleteProcedure({ variables: { procedureId: procedure._id } });
      await refetch();
      await Swal.fire({
        icon: "success",
        title: "Procedure deleted",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't delete procedure",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-white py-4 lg:py-5">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-white py-4 lg:py-5">
        <div className="grid min-h-[680px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
          <DashboardSidebar
            role="clinic"
            navigation={clinicNavigation}
            profileImage={profileImage}
            activeLabel="Procedures"
          />
          <section className="flex min-w-0 flex-col items-center justify-center gap-2 px-5 py-7 text-center sm:px-8 lg:px-10 lg:py-9">
            <p className="font-serif text-2xl font-semibold text-brand-teal-900">
              Couldn&apos;t load procedures
            </p>
            <p className="max-w-md text-sm text-brand-muted">{error.message}</p>
          </section>
        </div>
      </main>
    );
  }

  const procedures = data?.getMyProcedures.list ?? [];

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[680px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel="Procedures"
        />

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
                Procedures
              </h1>
              <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
                {procedures.length} {procedures.length === 1 ? "procedure" : "procedures"} listed · visible to patients on your clinic profile
              </p>
            </div>
            <Link
              href="/dashboard/clinic/procedures/new"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center self-start rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-lg"
            >
              + Add procedure
            </Link>
          </header>

          <div className="mt-8 max-h-[390px] space-y-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
            {procedures.map((procedure, index) => (
              <article
                key={procedure._id}
                className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-4 transition duration-200 hover:border-brand-teal-500 hover:shadow-lg md:flex-row md:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    className={`h-16 w-16 shrink-0 rounded-xl bg-linear-to-br ${thumbnailTones[index % thumbnailTones.length]}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-brand-ink">
                      {procedure.procedureName}
                    </h2>
                    <span className="mt-2 inline-flex rounded-full bg-brand-teal-100 px-3 py-1 text-xs font-semibold text-brand-teal-700">
                      {formatCategory(procedure.procedureCategory)}
                    </span>
                    <p className="mt-2 text-sm text-brand-muted">
                      Duration: {procedure.procedureDuration} {procedure.procedureDuration === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>

                <div className="md:min-w-[175px] md:text-right">
                  <p className="font-serif text-lg font-semibold text-brand-teal-900">
                    {formatMoney(procedure.procedurePriceMin, procedure.procedureCurrency)}–{formatMoney(procedure.procedurePriceMax, procedure.procedureCurrency)}
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/dashboard/clinic/procedures/${procedure._id}/edit`}
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-brand-line px-4 text-sm font-semibold text-brand-muted transition hover:border-brand-teal-500 hover:bg-brand-cream hover:text-brand-teal-700"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeProcedure(procedure)}
                    className="min-h-10 cursor-pointer rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}

            {procedures.length === 0 && (
              <div className="rounded-2xl border border-dashed border-brand-line px-6 py-16 text-center">
                <p className="font-serif text-2xl font-semibold text-brand-teal-900">
                  No procedures listed yet
                </p>
                <p className="mt-2 text-sm text-brand-muted">
                  Add your first procedure to make it visible on the clinic profile.
                </p>
                <Link
                  href="/dashboard/clinic/procedures/new"
                  className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white hover:bg-brand-teal-900"
                >
                  + Add procedure
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatMoney(value: number, currency: "USD" | "KRW") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCategory(category: string) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
