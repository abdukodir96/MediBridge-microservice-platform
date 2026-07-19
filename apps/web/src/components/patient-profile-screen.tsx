"use client";

import Image from "next/image";
import Link from "next/link";
import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Swal from "sweetalert2";
import {
  savePatientProfile,
  usePatientProfile,
} from "@/components/patient-profile-store";
import { useProfileImage } from "@/components/use-profile-image";

type MemberEmailProfile = {
  _id: string;
  memberEmail: string;
};

const GET_MY_PROFILE: TypedDocumentNode<{
  getMyProfile: MemberEmailProfile;
}> = gql`
  query GetMyProfile {
    getMyProfile {
      _id
      memberEmail
    }
  }
`;

const UPDATE_MY_EMAIL: TypedDocumentNode<
  { updateMyEmail: MemberEmailProfile },
  { input: { memberEmail: string } }
> = gql`
  mutation UpdateMyEmail($input: UpdateMemberEmailInput!) {
    updateMyEmail(input: $input) {
      _id
      memberEmail
    }
  }
`;

function subscribeToAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function getServerAccessToken() {
  return null;
}

const countries = [
  { value: "China", label: "🇨🇳 China" },
  { value: "South Korea", label: "🇰🇷 South Korea" },
  { value: "Japan", label: "🇯🇵 Japan" },
  { value: "Uzbekistan", label: "🇺🇿 Uzbekistan" },
  { value: "United States", label: "🇺🇸 United States" },
];

const languages = [
  "中文 (Chinese)",
  "English",
  "日本語 (Japanese)",
  "한국어 (Korean)",
  "O‘zbek tili",
];

const countryFlags: Record<string, string> = {
  China: "🇨🇳",
  "South Korea": "🇰🇷",
  Japan: "🇯🇵",
  Uzbekistan: "🇺🇿",
  "United States": "🇺🇸",
};

const patientNavigation = [
  { icon: "👤", label: "My Page", href: "/dashboard/patient" },
  { icon: "⌕", label: "Find clinics", href: "/clinics" },
  { icon: "💬", label: "Messages", href: "/dashboard/messages" },
];

export function PatientProfileScreen() {
  const profileImage = useProfileImage();
  const { profile, snapshot } = usePatientProfile();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const accessToken = useSyncExternalStore(
    subscribeToAuth,
    getAccessToken,
    getServerAccessToken,
  );
  const authenticated = Boolean(accessToken);
  const { data: profileData } = useQuery(GET_MY_PROFILE, {
    skip: !authenticated,
    fetchPolicy: "network-only",
  });
  const [updateMyEmail, { loading: saving }] = useMutation(UPDATE_MY_EMAIL);
  const email =
    emailDraft ?? profileData?.getMyProfile.memberEmail ?? profile.email;

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      await Swal.fire({
        icon: "warning",
        title: "Unsupported image",
        text: "Please choose a JPG or PNG image.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire({
        icon: "warning",
        title: "Image is too large",
        text: "The maximum profile image size is 5MB.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPendingPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const nickname = String(formData.get("nickname") ?? "").trim();
    const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!fullName || !nickname || !nextEmail || !phone) {
      await Swal.fire({
        icon: "warning",
        title: "Please complete your profile",
        text: "Full name, display name, email, and phone number are required.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    if (!authenticated) {
      await Swal.fire({
        icon: "info",
        title: "Please log in first",
        text: "You need to be logged in to update the email stored in your account.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    let savedEmail = nextEmail;
    try {
      const { data } = await updateMyEmail({
        variables: { input: { memberEmail: nextEmail } },
      });
      savedEmail = data?.updateMyEmail.memberEmail ?? nextEmail;
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Email could not be updated",
        text: error instanceof Error ? error.message : "Please try again.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    savePatientProfile({
      fullName,
      nickname,
      email: savedEmail,
      phone,
      country: String(formData.get("country") ?? profile.country),
      language: String(formData.get("language") ?? profile.language),
    });
    setEmailDraft(savedEmail);
    localStorage.setItem("memberEmail", savedEmail);

    if (pendingPhoto) {
      localStorage.setItem("memberImage", pendingPhoto);
      window.dispatchEvent(new Event("storage"));
      setPendingPhoto(null);
    }

    await Swal.fire({
      icon: "success",
      title: "Profile updated",
      text: "Your profile changes have been saved.",
      confirmButtonColor: "#125453",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const cancelChanges = () => {
    formRef.current?.reset();
    setEmailDraft(null);
    setPendingPhoto(null);
  };

  return (
    <main className="relative z-20 flex-1 bg-white py-4 lg:py-5">
      <div className="relative z-20 grid min-h-[650px] w-full overflow-visible border border-brand-line bg-white lg:grid-cols-[310px_minmax(0,1fr)]">
        <ProfileSidebar
          profileImage={pendingPhoto ?? profileImage}
          fullName={profile.fullName}
          country={profile.country}
        />

        <section className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <header>
            <h1 className="font-serif text-[30px] font-semibold text-brand-teal-900 sm:text-[36px]">
              Profile settings
            </h1>
            <p className="mt-1.5 text-sm text-brand-muted sm:text-base">
              Update your personal information. This is only visible to clinics you interact with.
            </p>
          </header>

          <form
            key={snapshot}
            ref={formRef}
            onSubmit={saveChanges}
            className="mt-7"
          >
            <div className="flex flex-col gap-5 border-b border-brand-line pb-7 sm:flex-row sm:items-center">
              <Image
                src={pendingPhoto ?? profileImage}
                alt={profile.fullName}
                width={88}
                height={88}
                className="h-[88px] w-[88px] rounded-full border border-brand-line object-cover"
              />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhoto}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-11 items-center rounded-xl border border-brand-line bg-white px-5 text-sm font-semibold text-brand-ink transition hover:border-brand-teal-500 hover:bg-brand-cream"
                >
                  📷 Change photo
                </button>
                <p className="mt-2 text-xs text-brand-muted">JPG or PNG, maximum 5MB</p>
              </div>
            </div>

            <div className="mt-7 grid gap-x-6 gap-y-5 md:grid-cols-2">
              <ProfileField label="Full name">
                <input
                  required
                  name="fullName"
                  defaultValue={profile.fullName}
                  className={inputClass}
                />
              </ProfileField>
              <ProfileField label="Display name (nickname)">
                <input
                  required
                  name="nickname"
                  defaultValue={profile.nickname}
                  className={inputClass}
                />
              </ProfileField>
              <ProfileField label="Email">
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmailDraft(event.target.value)}
                  className={inputClass}
                />
              </ProfileField>
              <ProfileField label="Phone number">
                <input
                  required
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone}
                  className={inputClass}
                />
              </ProfileField>
              <ProfileField label="Country">
                <ProfileSelect
                  name="country"
                  defaultValue={profile.country}
                  options={countries}
                />
              </ProfileField>
              <ProfileField label="Preferred language">
                <ProfileSelect
                  name="language"
                  defaultValue={profile.language}
                  options={languages.map((language) => ({
                    value: language,
                    label: language,
                  }))}
                />
              </ProfileField>
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-brand-line pt-6">
              <button
                type="submit"
                disabled={saving}
                className="min-h-12 rounded-xl bg-brand-teal-700 px-6 text-sm font-bold text-white transition hover:bg-brand-teal-900 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelChanges}
                className="min-h-12 rounded-xl border border-brand-line bg-white px-6 text-sm font-semibold text-brand-muted transition hover:border-brand-teal-500 hover:bg-brand-cream"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function ProfileSidebar({
  profileImage,
  fullName,
  country,
}: {
  profileImage: string;
  fullName: string;
  country: string;
}) {
  return (
    <aside className="flex border-b border-brand-line bg-[#fdfcf9] lg:min-h-full lg:flex-col lg:border-b-0 lg:border-r">
      <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto p-4 lg:block lg:space-y-2 lg:p-5">
        {patientNavigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-base font-semibold text-brand-muted transition hover:bg-brand-cream hover:text-brand-teal-900"
          >
            <span
              className={item.label === "Find clinics" ? "text-4xl" : "text-xl"}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/dashboard/profile"
        className="m-4 hidden items-center gap-3 rounded-xl border-t border-brand-line bg-brand-teal-100 p-4 transition hover:bg-brand-teal-100/80 lg:flex"
      >
        <Image
          src={profileImage}
          alt={fullName}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full border border-brand-line object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-brand-teal-700">{fullName}</p>
          <p className="mt-0.5 text-xs text-brand-muted">
            Patient · {countryFlags[country] ?? "🌐"}
          </p>
        </div>
        <span className="ml-auto text-brand-muted">›</span>
      </Link>
    </aside>
  );
}

function ProfileSelect({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          inputClass +
          " flex items-center justify-between gap-3 text-left"
        }
      >
        <span className="truncate">{selectedOption?.label}</span>
        <span
          className={
            "shrink-0 text-brand-teal-700 transition-transform duration-300 " +
            (open ? "rotate-180" : "")
          }
        >
          ▾
        </span>
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={
          "absolute left-0 right-0 top-[calc(100%+8px)] z-[70] max-h-64 origin-top overflow-y-auto rounded-xl border border-brand-line bg-white p-2 shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-300 ease-out " +
          (open
            ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-y-95 opacity-0")
        }
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={value === option.value}
            onClick={() => {
              setValue(option.value);
              setOpen(false);
            }}
            className={
              "flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium transition " +
              (value === option.value
                ? "bg-brand-teal-100 text-brand-teal-900"
                : "text-brand-ink hover:bg-brand-cream")
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}


function ProfileField({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-brand-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "min-h-14 w-full rounded-xl border border-brand-line bg-white px-4 py-3 text-sm text-brand-ink outline-none transition focus:border-brand-teal-500 focus:ring-3 focus:ring-brand-teal-100";
