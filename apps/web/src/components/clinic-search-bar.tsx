"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchVariant = "hero" | "compact";

type ClinicSearchBarProps = {
  variant?: SearchVariant;
  initialTreatment?: string;
  initialCity?: string;
  initialLanguage?: string;
};

const treatments = [
  "Plastic Surgery",
  "Rhinoplasty",
  "Dermatology",
  "Face Contour",
  "Dental",
  "Hair Transplant",
];

const cities = ["Gangnam-gu", "Sinsa-dong", "Apgujeong"];
const languages = ["English", "Chinese", "Japanese"];

export function ClinicSearchBar({
  variant = "hero",
  initialTreatment = "",
  initialCity = "",
  initialLanguage = "",
}: ClinicSearchBarProps) {
  const router = useRouter();
  const [treatment, setTreatment] = useState(initialTreatment);
  const [city, setCity] = useState(initialCity);
  const [language, setLanguage] = useState(initialLanguage);
  const isHero = variant === "hero";

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new URLSearchParams();
    if (treatment) query.set("treatment", treatment);
    if (city) query.set("city", city);
    if (language) query.set("language", language);
    const search = query.toString();
    router.push(search ? `/clinics?${search}` : "/clinics");
  };

  return (
    <form
      onSubmit={submitSearch}
      className={`flex flex-col divide-y divide-brand-line border border-brand-line bg-white shadow-brand-teal-900/8 sm:flex-row sm:divide-x sm:divide-y-0 ${
        isHero
          ? "mb-4 max-w-5xl rounded-[20px] p-5 shadow-xl"
          : "max-w-5xl rounded-2xl p-2 shadow-lg"
      }`}
    >
      <SearchSelect
        label="Treatment"
        value={treatment}
        onChange={setTreatment}
        options={treatments}
        placeholder="All treatments"
        large={isHero}
      />
      <SearchSelect
        label="City"
        value={city}
        onChange={setCity}
        options={cities}
        placeholder="All Seoul"
        large={isHero}
      />
      <SearchSelect
        label="Language"
        value={language}
        onChange={setLanguage}
        options={languages}
        placeholder="Any language"
        large={isHero}
      />
      <button
        type="submit"
        className={`mt-2 flex shrink-0 items-center justify-center bg-brand-gold font-bold text-brand-teal-900 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-gold/90 hover:shadow-lg active:translate-y-0 sm:mt-0 ${
          isHero
            ? "rounded-2xl px-12 py-5 text-xl"
            : "rounded-xl px-8 py-3 text-base"
        }`}
      >
        Search →
      </button>
    </form>
  );
}

function SearchSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  large,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  large: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const items = [{ value: "", label: placeholder }, ...options.map((option) => ({ value: option, label: option }))];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  return (
    <div
      ref={dropdownRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
      className={`relative flex min-w-0 flex-1 flex-col justify-center ${large ? "py-5" : "py-3"}`}
    >
      <span className={`font-semibold uppercase tracking-wide text-brand-muted ${large ? "px-7 text-base" : "px-5 text-xs"}`}>
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`mt-1 flex w-full cursor-pointer items-center justify-between bg-transparent text-left font-medium text-brand-ink outline-none ${large ? "px-7 text-xl" : "px-5 text-base"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <span className={`ml-4 shrink-0 text-xs text-brand-teal-700 transition-transform duration-[350ms] ease-out ${open ? "rotate-180" : "rotate-0"}`}>▼</span>
      </button>

      <div
        role="listbox"
        aria-label={label}
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 origin-top overflow-hidden rounded-xl border border-brand-line bg-white p-1.5 shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-[350ms] ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-y-90 opacity-0"
        }`}
      >
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value || "all"}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left transition-colors duration-150 ${
                selected
                  ? "bg-brand-teal-100 font-semibold text-brand-teal-700"
                  : "text-brand-ink hover:bg-brand-cream"
              }`}
            >
              <span>{item.label}</span>
              {selected && <span className="text-brand-teal-700">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
