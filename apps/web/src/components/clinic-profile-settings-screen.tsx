"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import {
  clinicNavigation,
  DashboardSidebar,
} from "@/components/dashboard-screen";
import {
  saveClinicProfile,
  useClinicProfile,
  type ClinicProfile,
} from "@/components/clinic-profile-store";
import { useProfileImage } from "@/components/use-profile-image";

const specialtyOptions = [
  "Plastic Surgery",
  "Dermatology",
  "Dental",
  "Ophthalmology",
  "Hair Transplant",
  "Orthopedics",
];

const languageOptions = [
  "English",
  "中文 Chinese",
  "日本語 Japanese",
  "한국어 Korean",
  "O‘zbek tili",
];

const galleryTones = [
  "from-brand-teal-500 to-brand-teal-900",
  "from-brand-teal-700 to-brand-teal-900",
  "from-brand-teal-500 to-brand-teal-700",
  "from-brand-gold to-amber-700",
];

const MAX_GALLERY_IMAGES = 10;

export function ClinicProfileSettingsScreen() {
  const profileImage = useProfileImage();
  const { profile } = useClinicProfile();

  return (
    <main className="relative z-20 flex-1 bg-white py-4 lg:py-5">
      <div className="relative z-20 grid min-h-[650px] w-full overflow-visible border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <DashboardSidebar
          role="clinic"
          navigation={clinicNavigation}
          profileImage={profileImage}
          activeLabel=""
          identityActive
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

          <ClinicProfileForm profile={profile} />
        </section>
      </div>
    </main>
  );
}

type GalleryItem = {
  id: string;
  name: string;
  previewUrl?: string;
};

function createStoredGalleryItems(images: string[]): GalleryItem[] {
  return images.map((name, index) => ({
    id: `stored-${index}-${name}`,
    name,
  }));
}

function ClinicProfileForm({ profile }: { profile: ClinicProfile }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const [specialties, setSpecialties] = useState(profile.specialties);
  const [languages, setLanguages] = useState(profile.languages);
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    createStoredGalleryItems(profile.gallery),
  );
  const savedSpecialtiesRef = useRef(profile.specialties);
  const savedLanguagesRef = useRef(profile.languages);
  const savedGalleryRef = useRef(gallery);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  const toggleItem = (
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );
  };

  const addGalleryFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (selected.length === 0) return;

    const existingNames = new Set(gallery.map((item) => item.name));
    const uniqueSelected = selected.filter(
      (file, index) =>
        !existingNames.has(file.name) &&
        selected.findIndex((candidate) => candidate.name === file.name) ===
          index,
    );

    if (uniqueSelected.length === 0) return;

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

    let filesToAdd = uniqueSelected;
    if (uniqueSelected.length > availableSlots) {
      await Swal.fire({
        icon: "warning",
        title: "Only some images were added",
        text: `Your gallery can contain up to ${MAX_GALLERY_IMAGES} images. ${availableSlots} remaining slot${availableSlots === 1 ? "" : "s"} will be filled.`,
        confirmButtonColor: "#125453",
      });
      filesToAdd = uniqueSelected.slice(0, availableSlots);
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

    setGallery((current) => {
      const existingNames = new Set(current.map((item) => item.name));
      const additions = filesToAdd
        .filter((file) => !existingNames.has(file.name))
        .slice(0, MAX_GALLERY_IMAGES - current.length)
        .map((file) => {
          const previewUrl = URL.createObjectURL(file);
          previewUrlsRef.current.add(previewUrl);

          return {
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            previewUrl,
          };
        });

      return [...current, ...additions];
    });

    requestAnimationFrame(() => {
      galleryScrollRef.current?.scrollTo({
        left: galleryScrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    });
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

    saveClinicProfile({
      name,
      address,
      description,
      specialties,
      languages,
      gallery: gallery.map((item) => item.name),
    });

    savedSpecialtiesRef.current = specialties;
    savedLanguagesRef.current = languages;
    savedGalleryRef.current = gallery;

    await Swal.fire({
      icon: "success",
      title: "Clinic profile updated",
      text: "Your public clinic information has been saved.",
      confirmButtonColor: "#125453",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const cancelChanges = () => {
    formRef.current?.reset();
    setSpecialties(savedSpecialtiesRef.current);
    setLanguages(savedLanguagesRef.current);

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

      <div className="mt-5 grid gap-3 rounded-xl bg-brand-cream p-4 sm:grid-cols-3">
        <ReadOnlyStat label="Rating" value="4.9 ★" />
        <ReadOnlyStat label="Reviews" value="312" />
        <ReadOnlyStat label="Member since" value="2024" />
      </div>

      <div className="mt-7 grid gap-x-6 gap-y-5 md:grid-cols-2">
        <ProfileField label="Clinic name" required>
          <input
            required
            name="name"
            defaultValue={profile.name}
            className={inputClass}
          />
        </ProfileField>
        <ProfileField label="Address" required>
          <input
            required
            name="address"
            defaultValue={profile.address}
            className={inputClass}
          />
        </ProfileField>

        <div className="md:col-span-2">
          <ProfileField label="Description">
            <textarea
              name="description"
              defaultValue={profile.description}
              rows={4}
              className={inputClass + " resize-y py-3"}
            />
          </ProfileField>
        </div>

        <div className="md:col-span-2">
          <ProfileField label="Specialties" required hint="Select all that apply">
            <MultiSelectPills
              options={specialtyOptions}
              selected={specialties}
              onToggle={(item) => toggleItem(item, setSpecialties)}
              label="Clinic specialties"
            />
          </ProfileField>
        </div>

        <div className="md:col-span-2">
          <ProfileField label="Languages spoken">
            <MultiSelectPills
              options={languageOptions}
              selected={languages}
              onToggle={(item) => toggleItem(item, setLanguages)}
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
                {gallery.map((image, index) => (
                  <div
                    key={image.id}
                    style={
                      image.previewUrl
                        ? { backgroundImage: `url(${image.previewUrl})` }
                        : undefined
                    }
                    className={`relative aspect-[4/3] w-[250px] shrink-0 overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat sm:w-[280px] lg:w-[300px] ${
                      image.previewUrl
                        ? "bg-brand-cream"
                        : `bg-linear-to-br ${galleryTones[index % galleryTones.length]}`
                    }`}
                  >
                    <span className="absolute inset-x-2 bottom-2 truncate rounded-md bg-black/55 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                      {image.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${image.name}`}
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

      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-brand-line pt-6">
        <button
          type="submit"
          className="min-h-12 cursor-pointer rounded-xl bg-brand-teal-700 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-md"
        >
          Save changes
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

function MultiSelectPills({
  options,
  selected,
  onToggle,
  label,
}: {
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
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
            {item}
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
