"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import { useMutation } from "@apollo/client/react";
import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import { useProfileImage } from "@/components/use-profile-image";
import { useClinic } from "@/context/clinic-context";
import { UPDATE_CLINIC } from "@/lib/graphql/clinic-settings";
import type { Clinic, ClinicSpecialty, MemberLang } from "@/lib/graphql/clinics";
import { titleCaseEnum, langLabel } from "@/lib/clinic-format";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const SPECIALTY_OPTIONS: ClinicSpecialty[] = [
  "PLASTIC_SURGERY",
  "DERMATOLOGY",
  "DENTAL",
  "OPHTHALMOLOGY",
  "HAIR_TRANSPLANT",
  "ORTHOPEDICS",
];

const LANG_OPTIONS: MemberLang[] = ["EN", "ZH", "JA", "KO"];

const MAX_GALLERY_IMAGES = 10;

export function ClinicProfileSettingsScreen() {
  const profileImage = useProfileImage();
  const { clinic } = useClinic();

  return (
    <main className="relative z-20 flex-1 bg-white py-4 lg:py-5">
      <div className="relative z-20 grid min-h-[650px] w-full overflow-visible border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel=""
          identityActive
          identityName={clinic.clinicName}
        />

        <section className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <header>
            <h1 className="font-serif text-[30px] font-semibold text-brand-teal-900 sm:text-[36px]">
              Clinic profile
            </h1>
            <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
              This information is shown publicly on your clinic page.
            </p>
          </header>

          <ClinicProfileForm clinic={clinic} />
        </section>
      </div>
    </main>
  );
}

type GalleryItem = {
  id: string;
  // The blob preview shown instantly on selection; swapped for the real
  // Cloudinary secure_url once the upload finishes.
  previewUrl: string;
  url: string | null; // null while uploading
};

function createStoredGalleryItems(images: string[]): GalleryItem[] {
  return images.map((url, index) => ({
    id: `stored-${index}-${url}`,
    previewUrl: url,
    url,
  }));
}

function ClinicProfileForm({ clinic }: { clinic: Clinic }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const [specialties, setSpecialties] = useState<ClinicSpecialty[]>(clinic.clinicSpecialties);
  const [langs, setLangs] = useState<MemberLang[]>(clinic.clinicLangs);
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    createStoredGalleryItems(clinic.clinicImages),
  );
  const savedSpecialtiesRef = useRef(specialties);
  const savedLangsRef = useRef(langs);
  const savedGalleryRef = useRef(gallery);

  const [updateClinic, { loading, error }] = useMutation(UPDATE_CLINIC);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  const toggleSpecialty = (item: ClinicSpecialty) => {
    setSpecialties((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  const toggleLang = (item: MemberLang) => {
    setLangs((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  const addGalleryFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (selected.length === 0) return;

    const availableSlots = MAX_GALLERY_IMAGES - gallery.length;
    if (availableSlots <= 0) {
      await Swal.fire({
        icon: "info",
        title: "Gallery limit reached",
        text: `You can upload up to ${MAX_GALLERY_IMAGES} clinic images.`,
        confirmButtonColor: "#125453",
      });
      return;
    }

    let filesToAdd = selected;
    if (selected.length > availableSlots) {
      await Swal.fire({
        icon: "warning",
        title: "Only some images were added",
        text: `Your gallery can contain up to ${MAX_GALLERY_IMAGES} images. ${availableSlots} remaining slot${availableSlots === 1 ? "" : "s"} will be filled.`,
        confirmButtonColor: "#125453",
      });
      filesToAdd = selected.slice(0, availableSlots);
    }

    const invalidType = filesToAdd.find(
      (file) => !["image/jpeg", "image/png"].includes(file.type),
    );
    if (invalidType) {
      await Swal.fire({
        icon: "warning",
        title: "Unsupported image",
        text: "Clinic gallery supports JPG and PNG images only.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    const oversized = filesToAdd.find(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversized) {
      await Swal.fire({
        icon: "warning",
        title: "Image is too large",
        text: "Each gallery image must be 10MB or smaller.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    // Add instant blob-preview placeholders (uploading), then swap each in
    // for its real Cloudinary url as its own upload resolves — independent
    // of the others, not a single all-or-nothing batch.
    const placeholders = filesToAdd.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`;
      return { id, previewUrl, file };
    });

    setGallery((current) => [
      ...current,
      ...placeholders.map(({ id, previewUrl }) => ({ id, previewUrl, url: null })),
    ]);

    requestAnimationFrame(() => {
      galleryScrollRef.current?.scrollTo({
        left: galleryScrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    });

    await Promise.all(
      placeholders.map(async ({ id, file, previewUrl }) => {
        try {
          const url = await uploadImageToCloudinary(file, "CLINIC_GALLERY");
          setGallery((current) =>
            current.map((item) => (item.id === id ? { ...item, url } : item)),
          );
        } catch (err) {
          setGallery((current) => current.filter((item) => item.id !== id));
          URL.revokeObjectURL(previewUrl);
          previewUrlsRef.current.delete(previewUrl);
          await Swal.fire({
            icon: "error",
            title: "Upload failed",
            text: (err as Error).message,
            confirmButtonColor: "#125453",
          });
        }
      }),
    );
  };

  const removeGalleryItem = (item: GalleryItem) => {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
      previewUrlsRef.current.delete(item.previewUrl);
    }

    setGallery((current) =>
      current.filter((galleryItem) => galleryItem.id !== item.id),
    );
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (specialties.length === 0) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name || !address || specialties.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Complete the required fields",
        text: "Clinic name, address, and at least one specialty are required.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    if (gallery.some((item) => item.url === null)) {
      await Swal.fire({
        icon: "info",
        title: "Still uploading",
        text: "Wait for all gallery images to finish uploading before saving.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    try {
      await updateClinic({
        variables: {
          clinicId: clinic._id,
          input: {
            clinicName: name,
            clinicAddress: address,
            clinicDesc: description || undefined,
            clinicSpecialties: specialties,
            clinicLangs: langs,
            clinicImages: gallery.map((item) => item.url as string),
          },
        },
      });

      savedSpecialtiesRef.current = specialties;
      savedLangsRef.current = langs;
      savedGalleryRef.current = gallery;

      await Swal.fire({
        icon: "success",
        title: "Clinic profile updated",
        text: "Your public clinic information has been saved.",
        confirmButtonColor: "#125453",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Couldn't save clinic profile",
        text: (err as Error).message,
        confirmButtonColor: "#125453",
      });
    }
  };

  const cancelChanges = () => {
    formRef.current?.reset();
    setSpecialties(savedSpecialtiesRef.current);
    setLangs(savedLangsRef.current);

    const savedPreviewUrls = new Set(
      savedGalleryRef.current
        .map((item) => item.previewUrl)
        .filter((url): url is string => Boolean(url)),
    );
    gallery.forEach((item) => {
      if (item.previewUrl && !savedPreviewUrls.has(item.previewUrl)) {
        URL.revokeObjectURL(item.previewUrl);
        previewUrlsRef.current.delete(item.previewUrl);
      }
    });
    setGallery(savedGalleryRef.current);
  };

  return (
    <form ref={formRef} onSubmit={submitProfile} className="mt-7">
      <VerificationBadge status={clinic.clinicStatus} />

      <div className="mt-5 grid gap-3 rounded-xl bg-brand-cream p-4 sm:grid-cols-2">
        <ReadOnlyStat label="Rating" value={`${clinic.clinicRating.toFixed(1)} ★`} />
        <ReadOnlyStat label="Reviews" value={String(clinic.clinicReviewCount)} />
      </div>

      <div className="mt-7 grid gap-x-6 gap-y-5 md:grid-cols-2">
        <ProfileField label="Clinic name" required>
          <input
            required
            name="name"
            defaultValue={clinic.clinicName}
            className={inputClass}
          />
        </ProfileField>
        <ProfileField label="Address" required>
          <input
            required
            name="address"
            defaultValue={clinic.clinicAddress}
            className={inputClass}
          />
        </ProfileField>

        <div className="md:col-span-2">
          <ProfileField label="Description">
            <textarea
              name="description"
              defaultValue={clinic.clinicDesc}
              rows={4}
              className={inputClass + " resize-y py-3"}
            />
          </ProfileField>
        </div>

        <div className="md:col-span-2">
          <ProfileField label="Specialties" required hint="Select all that apply">
            <MultiSelectPills
              options={SPECIALTY_OPTIONS}
              selected={specialties}
              onToggle={toggleSpecialty}
              formatLabel={titleCaseEnum}
              label="Clinic specialties"
            />
          </ProfileField>
        </div>

        <div className="md:col-span-2">
          <ProfileField label="Languages spoken">
            <MultiSelectPills
              options={LANG_OPTIONS}
              selected={langs}
              onToggle={toggleLang}
              formatLabel={langLabel}
              label="Languages spoken"
            />
          </ProfileField>
        </div>

        <div className="md:col-span-2">
          <ProfileField
            label="Gallery images"
            hint={`${gallery.length}/${MAX_GALLERY_IMAGES}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) addGalleryFiles(event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />
            <div className="mb-2 flex justify-end gap-2">
              <button
                type="button"
                aria-label="Scroll gallery left"
                onClick={() =>
                  galleryScrollRef.current?.scrollBy({
                    left: -340,
                    behavior: "smooth",
                  })
                }
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-brand-line bg-white text-lg text-brand-teal-900 transition hover:border-brand-teal-500 hover:bg-brand-cream"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Scroll gallery right"
                onClick={() =>
                  galleryScrollRef.current?.scrollBy({
                    left: 340,
                    behavior: "smooth",
                  })
                }
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-brand-line bg-white text-lg text-brand-teal-900 transition hover:border-brand-teal-500 hover:bg-brand-cream"
              >
                →
              </button>
            </div>

            <div
              ref={galleryScrollRef}
              className="overflow-x-auto overscroll-x-contain pb-3 scroll-smooth [scrollbar-gutter:stable]"
            >
              <div className="flex min-w-max gap-3">
                {gallery.map((image) => (
                  <div
                    key={image.id}
                    style={{ backgroundImage: `url(${image.url ?? image.previewUrl})` }}
                    className="relative aspect-[4/3] w-[250px] shrink-0 overflow-hidden rounded-xl bg-brand-cream bg-cover bg-center bg-no-repeat sm:w-[280px] lg:w-[300px]"
                  >
                    {image.url === null && (
                      <span className="absolute inset-x-2 bottom-2 truncate rounded-md bg-black/55 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                        Uploading...
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => removeGalleryItem(image)}
                      className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-sm text-brand-ink shadow-sm transition hover:bg-red-50 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {gallery.length < MAX_GALLERY_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      addGalleryFiles(event.dataTransfer.files);
                    }}
                    className="flex aspect-[4/3] w-[250px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand-line bg-white text-sm text-brand-muted transition hover:border-brand-teal-500 hover:bg-brand-cream sm:w-[280px] lg:w-[300px]"
                  >
                    <span className="mb-2 text-2xl">📷</span>
                    Add photo
                    <span className="mt-1 text-[10px]">
                      JPG/PNG · max 10MB · up to {MAX_GALLERY_IMAGES}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </ProfileField>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-brand-line pt-6">
        <button
          type="submit"
          disabled={loading || specialties.length === 0 || gallery.some((item) => item.url === null)}
          className="min-h-12 cursor-pointer rounded-xl bg-brand-teal-700 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={cancelChanges}
          className="min-h-12 cursor-pointer rounded-xl border border-brand-line bg-white px-6 text-sm font-semibold text-brand-muted transition hover:border-brand-teal-500 hover:bg-brand-cream"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function VerificationBadge({ status }: { status?: string }) {
  if (status === "PENDING") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white">
          ⏳
        </span>
        <div>
          <p className="font-bold text-amber-800">Awaiting verification</p>
          <p className="mt-0.5 text-sm text-brand-muted">
            An admin will review your clinic before it appears to patients.
          </p>
        </div>
      </div>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 font-bold text-white">
          !
        </span>
        <div>
          <p className="font-bold text-red-700">Clinic suspended</p>
          <p className="mt-0.5 text-sm text-brand-muted">
            Your clinic is currently hidden from patients. Contact support for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-teal-100 bg-linear-to-r from-brand-teal-100 to-brand-cream px-5 py-4 sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
        ✓
      </span>
      <div>
        <p className="font-bold text-brand-teal-900">Verified clinic</p>
        <p className="mt-0.5 text-sm text-brand-muted">
          Status is set by MediBridge admin review and cannot be edited here.
        </p>
      </div>
      <span className="self-start rounded-md border border-brand-line bg-white px-2.5 py-1 text-[10px] font-bold text-brand-muted sm:ml-auto sm:self-center">
        READ-ONLY
      </span>
    </div>
  );
}

function MultiSelectPills<T extends string>({
  options,
  selected,
  onToggle,
  formatLabel,
  label,
}: {
  options: T[];
  selected: T[];
  onToggle: (item: T) => void;
  formatLabel: (item: T) => string;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(item)}
            className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition ${
              active
                ? "border-brand-teal-700 bg-brand-teal-100 text-brand-teal-700"
                : "border-brand-line text-brand-muted hover:border-brand-teal-500 hover:bg-brand-cream"
            }`}
          >
            {active && <span className="mr-1">✓</span>}
            {formatLabel(item)}
          </button>
        );
      })}
    </div>
  );
}

function ProfileField({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-brand-muted">
        {label} {required && <span className="text-red-600">*</span>}{" "}
        {hint && <span className="font-normal">({hint})</span>}
      </p>
      {children}
    </div>
  );
}

function ReadOnlyStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-brand-muted">{label}</p>
      <strong className="mt-1 block font-serif text-xl font-semibold text-brand-teal-900">
        {value}
      </strong>
    </div>
  );
}

const inputClass =
  "min-h-12 w-full rounded-xl border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/65 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-100";
