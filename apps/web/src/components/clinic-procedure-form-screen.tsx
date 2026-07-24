"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { useProfileImage } from "@/components/use-profile-image";
import { useClinic } from "@/context/clinic-context";
import {
  CREATE_PROCEDURE,
  GET_PROCEDURE,
  UPDATE_PROCEDURE,
  type Procedure,
  type ProcedureCategory,
  type ProcedureCurrency,
} from "@/lib/graphql/procedures";

const categories: ProcedureCategory[] = ["FACE", "BODY", "SKIN", "DENTAL", "HAIR", "EYE"];

function formatCategory(category: string) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

export function ClinicProcedureFormScreen({
  mode,
  procedureId,
}: {
  mode: "add" | "edit";
  procedureId?: string;
}) {
  const profileImage = useProfileImage();
  const { clinic, clinicId } = useClinic();
  const { data, loading, error } = useQuery(GET_PROCEDURE, {
    variables: { procedureId: procedureId ?? "" },
    skip: mode === "add",
  });

  const procedure = mode === "edit" ? data?.getProcedure : undefined;

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[780px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel="Procedures"
          identityName={clinic.clinicName}
        />

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {mode === "edit" && loading ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-teal-700" />
            </div>
          ) : mode === "add" || procedure ? (
            <ProcedureForm
              key={`${mode}:${procedureId ?? "new"}`}
              mode={mode}
              clinicId={clinicId}
              procedure={procedure}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-line px-6 py-20 text-center">
              <h1 className="font-serif text-3xl font-semibold text-brand-teal-900">
                Procedure not found
              </h1>
              <p className="mt-2 text-sm text-brand-muted">
                {error?.message ??
                  "This procedure may have been deleted or its link is no longer valid."}
              </p>
              <Link
                href="/dashboard/clinic/procedures"
                className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand-teal-700 px-5 text-sm font-bold text-white hover:bg-brand-teal-900"
              >
                Back to procedures
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProcedureForm({
  mode,
  clinicId,
  procedure,
}: {
  mode: "add" | "edit";
  clinicId: string;
  procedure?: Procedure;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<ProcedureCategory>(procedure?.procedureCategory ?? "FACE");
  const [currency, setCurrency] = useState<ProcedureCurrency>(procedure?.procedureCurrency ?? "USD");
  const [images, setImages] = useState<string[]>(procedure?.procedureImages ?? []);
  const [priceMin, setPriceMin] = useState(procedure?.procedurePriceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(procedure?.procedurePriceMax?.toString() ?? "");
  const isEditing = mode === "edit";

  const [createProcedure, { loading: creating }] = useMutation(CREATE_PROCEDURE);
  const [updateProcedure, { loading: updating }] = useMutation(UPDATE_PROCEDURE);
  const saving = creating || updating;

  // Frontend-side hint only — the backend validates this too, but a disabled
  // button + inline message gives the user faster feedback than a round trip.
  const priceInvalid =
    priceMin !== "" &&
    priceMax !== "" &&
    Number.isFinite(Number(priceMax)) &&
    Number.isFinite(Number(priceMin)) &&
    Number(priceMax) < Number(priceMin);

  const handleFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (selected.length === 0) return;

    const invalidType = selected.find(
      (file) => !["image/jpeg", "image/png"].includes(file.type),
    );
    if (invalidType) {
      await Swal.fire({
        icon: "warning",
        title: "Unsupported image",
        text: "Only JPG and PNG images can be selected.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    const oversized = selected.find((file) => file.size > 10 * 1024 * 1024);
    if (oversized) {
      await Swal.fire({
        icon: "warning",
        title: "Image is too large",
        text: "Each image must be 10MB or smaller.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    setImages((current) => [
      ...current,
      ...selected
        .map((file) => file.name)
        .filter((name) => !current.includes(name)),
    ]);
  };

  const submitProcedure = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (priceInvalid) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priceMinValue = Number(priceMin);
    const priceMaxValue = Number(priceMax);
    const duration = Number(formData.get("duration"));

    if (!name || !category || !Number.isFinite(priceMinValue) || !Number.isFinite(priceMaxValue)) {
      await Swal.fire({
        icon: "warning",
        title: "Complete the required fields",
        text: "Procedure name, category, and both prices are required.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    if (priceMinValue < 0 || priceMaxValue < priceMinValue) {
      await Swal.fire({
        icon: "warning",
        title: "Check the price range",
        text: "Maximum price must be greater than or equal to the minimum price.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    if (!Number.isFinite(duration) || duration < 0) {
      await Swal.fire({
        icon: "warning",
        title: "Check duration",
        text: "Duration cannot be a negative number.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    const input = {
      procedureName: name,
      procedureCategory: category,
      procedureDesc: description || undefined,
      procedurePriceMin: priceMinValue,
      procedurePriceMax: priceMaxValue,
      procedureCurrency: currency,
      procedureDuration: duration,
      procedureImages: images,
      procedureClinicId: clinicId,
    };

    try {
      if (isEditing && procedure) {
        await updateProcedure({ variables: { procedureId: procedure._id, input } });
      } else {
        await createProcedure({ variables: { input } });
      }

      await Swal.fire({
        icon: "success",
        title: isEditing ? "Procedure updated" : "Procedure added",
        text: `${name} is now available in your clinic procedure list.`,
        confirmButtonColor: "#125453",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/dashboard/clinic/procedures");
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't save procedure",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  return (
    <>
      <header>
        <h1 className="font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
          {isEditing ? "Edit procedure" : "Add procedure"}
        </h1>
        <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
          {isEditing
            ? `${procedure?.procedureName} · changes are visible to patients immediately`
            : "Add a treatment patients can discover on your clinic profile."}
        </p>
      </header>

      <form
        onSubmit={submitProcedure}
        className="mt-7 w-full rounded-2xl border border-brand-line bg-white p-5 sm:p-7"
      >
        <ProcedureField label="Procedure name" required>
          <input
            required
            name="name"
            defaultValue={procedure?.procedureName}
            placeholder="e.g. Rhinoplasty"
            className={inputClass}
          />
        </ProcedureField>

        <ProcedureField label="Category" required>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Procedure category">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={category === item}
                onClick={() => setCategory(item)}
                className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition ${
                  category === item
                    ? "border-brand-teal-700 bg-brand-teal-100 text-brand-teal-700"
                    : "border-brand-line text-brand-muted hover:border-brand-teal-500 hover:bg-brand-cream"
                }`}
              >
                {formatCategory(item)}
              </button>
            ))}
          </div>
        </ProcedureField>

        <ProcedureField label="Description">
          <textarea
            name="description"
            defaultValue={procedure?.procedureDesc}
            placeholder="Describe the procedure, consultation, and aftercare..."
            rows={4}
            className={inputClass + " resize-y py-3"}
          />
        </ProcedureField>

        <ProcedureField label="Price range" required>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:items-center">
            <input
              required
              type="number"
              min="0"
              step="1"
              value={priceMin}
              onChange={(event) => setPriceMin(event.target.value)}
              placeholder="Minimum"
              className={inputClass}
            />
            <span className="hidden text-brand-muted sm:block">–</span>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={priceMax}
              onChange={(event) => setPriceMax(event.target.value)}
              placeholder="Maximum"
              className={inputClass}
            />
            <div className="flex min-h-12 overflow-hidden rounded-xl border border-brand-line">
              {(["USD", "KRW"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrency(item)}
                  className={`cursor-pointer px-4 text-sm font-semibold transition ${
                    currency === item
                      ? "bg-brand-teal-700 text-white"
                      : "bg-white text-brand-muted hover:bg-brand-cream"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {priceInvalid ? (
            <p className="mt-2 text-xs font-semibold text-red-600">
              Maximum price must be greater than or equal to minimum price.
            </p>
          ) : (
            <p className="mt-2 text-xs text-brand-muted">
              Maximum must be greater than or equal to minimum.
            </p>
          )}
        </ProcedureField>

        <ProcedureField label="Duration (days)">
          <input
            name="duration"
            type="number"
            min="0"
            step="1"
            defaultValue={procedure?.procedureDuration ?? 0}
            className={inputClass}
          />
        </ProcedureField>

        <ProcedureField label="Images">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={(event) => {
              if (event.target.files) handleFiles(event.target.files);
              event.target.value = "";
            }}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFiles(event.dataTransfer.files);
            }}
            className="w-full cursor-pointer rounded-xl border border-dashed border-brand-line px-5 py-7 text-center text-sm text-brand-muted transition hover:border-brand-teal-500 hover:bg-brand-cream"
          >
            <span className="mb-2 block text-2xl">📷</span>
            Drop before/after photos here or click to browse
            <span className="mt-1 block text-xs">JPG, PNG · maximum 10MB each</span>
          </button>

          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((image) => (
                <span
                  key={image}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-teal-100 px-3 py-1.5 text-xs font-semibold text-brand-teal-700"
                >
                  📎 {image}
                  <button
                    type="button"
                    aria-label={`Remove ${image}`}
                    onClick={() =>
                      setImages((current) =>
                        current.filter((item) => item !== image),
                      )
                    }
                    className="cursor-pointer text-brand-muted hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </ProcedureField>

        <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-brand-line pt-6">
          <button
            type="submit"
            disabled={saving || priceInvalid}
            className="min-h-12 cursor-pointer rounded-xl bg-brand-teal-700 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {saving ? "Saving..." : isEditing ? "Save changes" : "Add procedure"}
          </button>
          <Link
            href="/dashboard/clinic/procedures"
            className="inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-brand-line px-6 text-sm font-semibold text-brand-muted transition hover:bg-brand-cream"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}

function ProcedureField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm font-semibold text-brand-muted">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "min-h-12 w-full rounded-xl border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/65 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-100";
