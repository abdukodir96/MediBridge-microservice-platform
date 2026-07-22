"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import {
  createClinicProcedure,
  makeProcedureId,
  updateClinicProcedure,
  useClinicProcedures,
  type ClinicProcedure,
} from "@/components/clinic-procedure-store";
import { useProfileImage } from "@/components/use-profile-image";

const categories = ["Face", "Body", "Skin", "Dental", "Hair", "Eye"];

const emptyProcedure: ClinicProcedure = {
  id: "",
  name: "",
  category: "Face",
  description: "",
  priceMin: 0,
  priceMax: 0,
  currency: "USD",
  recoveryDays: 0,
  images: [],
};

export function ClinicProcedureFormScreen({
  mode,
  procedureId,
}: {
  mode: "add" | "edit";
  procedureId?: string;
}) {
  const profileImage = useProfileImage();
  const { procedures, snapshot } = useClinicProcedures();
  const procedure =
    mode === "edit"
      ? procedures.find((item) => item.id === procedureId)
      : emptyProcedure;

  return (
    <main className="flex-1 bg-white py-4 lg:py-5">
      <div className="grid min-h-[780px] w-full overflow-hidden border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel="Procedures"
        />

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {procedure ? (
            <ProcedureForm
              key={`${mode}:${procedureId ?? "new"}:${snapshot}`}
              mode={mode}
              procedure={procedure}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-line px-6 py-20 text-center">
              <h1 className="font-serif text-3xl font-semibold text-brand-teal-900">
                Procedure not found
              </h1>
              <p className="mt-2 text-sm text-brand-muted">
                This procedure may have been deleted or its link is no longer valid.
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
  procedure,
}: {
  mode: "add" | "edit";
  procedure: ClinicProcedure;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(procedure.category);
  const [currency, setCurrency] = useState<"USD" | "KRW">(
    procedure.currency,
  );
  const [images, setImages] = useState(procedure.images);
  const isEditing = mode === "edit";

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
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priceMin = Number(formData.get("priceMin"));
    const priceMax = Number(formData.get("priceMax"));
    const recoveryDays = Number(formData.get("recoveryDays"));

    if (!name || !category || !Number.isFinite(priceMin) || !Number.isFinite(priceMax)) {
      await Swal.fire({
        icon: "warning",
        title: "Complete the required fields",
        text: "Procedure name, category, and both prices are required.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    if (priceMin < 0 || priceMax < priceMin) {
      await Swal.fire({
        icon: "warning",
        title: "Check the price range",
        text: "Maximum price must be greater than or equal to the minimum price.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    if (!Number.isFinite(recoveryDays) || recoveryDays < 0) {
      await Swal.fire({
        icon: "warning",
        title: "Check recovery duration",
        text: "Recovery duration cannot be a negative number.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    const nextProcedure: ClinicProcedure = {
      id: isEditing ? procedure.id : makeProcedureId(name),
      name,
      category,
      description,
      priceMin,
      priceMax,
      currency,
      recoveryDays,
      images,
    };

    if (isEditing) updateClinicProcedure(nextProcedure);
    else createClinicProcedure(nextProcedure);

    await Swal.fire({
      icon: "success",
      title: isEditing ? "Procedure updated" : "Procedure added",
      text: `${name} is now available in your clinic procedure list.`,
      confirmButtonColor: "#125453",
      timer: 1500,
      showConfirmButton: false,
    });
    router.push("/dashboard/clinic/procedures");
  };

  return (
    <>
      <header>
        <h1 className="font-serif text-[30px] font-semibold leading-tight text-brand-teal-900 sm:text-[36px]">
          {isEditing ? "Edit procedure" : "Add procedure"}
        </h1>
        <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
          {isEditing
            ? `${procedure.name} · changes are visible to patients immediately`
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
            defaultValue={procedure.name}
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
                {item}
              </button>
            ))}
          </div>
        </ProcedureField>

        <ProcedureField label="Description">
          <textarea
            name="description"
            defaultValue={procedure.description}
            placeholder="Describe the procedure, consultation, and aftercare..."
            rows={4}
            className={inputClass + " resize-y py-3"}
          />
        </ProcedureField>

        <ProcedureField label="Price range" required>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:items-center">
            <input
              required
              name="priceMin"
              type="number"
              min="0"
              step="1"
              defaultValue={procedure.priceMin || ""}
              placeholder="Minimum"
              className={inputClass}
            />
            <span className="hidden text-brand-muted sm:block">–</span>
            <input
              required
              name="priceMax"
              type="number"
              min="0"
              step="1"
              defaultValue={procedure.priceMax || ""}
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
          <p className="mt-2 text-xs text-brand-muted">
            Maximum must be greater than or equal to minimum.
          </p>
        </ProcedureField>

        <ProcedureField label="Recovery duration (days)">
          <input
            name="recoveryDays"
            type="number"
            min="0"
            step="1"
            defaultValue={procedure.recoveryDays}
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
            className="min-h-12 cursor-pointer rounded-xl bg-brand-teal-700 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-md"
          >
            {isEditing ? "Save changes" : "Add procedure"}
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
