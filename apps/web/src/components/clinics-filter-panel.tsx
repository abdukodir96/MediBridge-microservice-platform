"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const specialtyOptions = [
  "Plastic Surgery",
  "Rhinoplasty",
  "Face Contour",
  "Dermatology",
  "Dental",
  "Hair Transplant",
];

const languageOptions = [
  { value: "Chinese", label: "中文 (Chinese)" },
  { value: "Japanese", label: "日本語 (Japanese)" },
  { value: "English", label: "English" },
];

const locationOptions = ["Gangnam-gu", "Sinsa-dong", "Apgujeong"];

type ClinicsFilterPanelProps = {
  specialties: string[];
  languages: string[];
  locations: string[];
  minPrice: number;
  maxPrice: number;
};

export function ClinicsFilterPanel({
  specialties,
  languages,
  locations,
  minPrice,
  maxPrice,
}: ClinicsFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("treatment");
    params.delete("city");
    params.delete("language");

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    const query = params.toString();
    router.push(query ? `/clinics?${query}` : "/clinics");
  };

  const toggleFilter = (key: "specialties" | "languages" | "locations", current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateFilters({ [key]: next.join(",") || undefined });
  };

  const applyPrice = () => {
    updateFilters({
      minPrice: localMinPrice > 0 ? String(localMinPrice) : undefined,
      maxPrice: localMaxPrice < 8000 ? String(localMaxPrice) : undefined,
    });
  };

  return (
    <aside className="shrink-0 border-b border-brand-line bg-white p-6 lg:w-80 lg:border-b-0 lg:border-r lg:p-7 xl:w-[340px]">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-ink">Filters</h2>
        <button
          type="button"
          onClick={() => router.push("/clinics")}
          className="text-sm font-semibold text-brand-teal-500 transition hover:text-brand-teal-900 hover:underline"
        >
          Clear all
        </button>
      </div>

      <FilterGroup title="Specialty">
        {specialtyOptions.map((option) => (
          <FilterCheckbox
            key={option}
            label={option}
            checked={specialties.includes(option)}
            onChange={() => toggleFilter("specialties", specialties, option)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Location">
        {locationOptions.map((option) => (
          <FilterCheckbox
            key={option}
            label={option}
            checked={locations.includes(option)}
            onChange={() => toggleFilter("locations", locations, option)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price range (USD)">
        <div className="space-y-5 px-1 pb-1">
          <PriceSlider
            label="Minimum"
            value={localMinPrice}
            min={0}
            max={Math.max(0, localMaxPrice - 100)}
            onChange={setLocalMinPrice}
            onCommit={applyPrice}
          />
          <PriceSlider
            label="Maximum"
            value={localMaxPrice}
            min={Math.min(8000, localMinPrice + 100)}
            max={8000}
            onChange={setLocalMaxPrice}
            onCommit={applyPrice}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Language support" last>
        {languageOptions.map((option) => (
          <FilterCheckbox
            key={option.value}
            label={option.label}
            checked={languages.includes(option.value)}
            onChange={() => toggleFilter("languages", languages, option.value)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

export function ClinicsSort({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const options = [
    { value: "top-rated", label: "Top rated" },
    { value: "most-reviewed", label: "Most reviewed" },
    { value: "price-low", label: "Price: Low to high" },
    { value: "price-high", label: "Price: High to low" },
  ];
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "Top rated";

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const changeSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (sort === "top-rated") params.delete("sort");
    else params.set("sort", sort);
    const query = params.toString();
    router.push(query ? `/clinics?${query}` : "/clinics");
  };

  return (
    <div ref={sortRef} className="relative z-40 w-[210px] sm:w-[230px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-brand-line bg-white px-4 py-2 text-sm font-semibold text-brand-ink shadow-sm transition hover:border-brand-teal-500"
      >
        <span className="truncate"><span className="text-brand-muted">Sort:</span> {selectedLabel}</span>
        <span className={`shrink-0 text-xs text-brand-teal-700 transition-transform duration-[350ms] ${open ? "rotate-180" : "rotate-0"}`}>▼</span>
      </button>

      <div
        role="listbox"
        aria-label="Sort clinics"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] origin-top overflow-hidden rounded-xl border border-brand-line bg-white p-1.5 shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-[350ms] ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-y-90 opacity-0"
        }`}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                changeSort(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors ${
                selected
                  ? "bg-brand-teal-100 font-semibold text-brand-teal-700"
                  : "text-brand-ink hover:bg-brand-cream"
              }`}
            >
              <span>{option.label}</span>
              {selected && <span>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterGroup({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={`${last ? "" : "mb-7 border-b border-brand-line pb-7"}`}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-brand-muted">{title}</h3>
      {children}
    </section>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="mb-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-base text-brand-ink transition last:mb-0 hover:bg-brand-cream">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 shrink-0 rounded border-brand-line accent-brand-teal-700"
      />
      <span className="flex-1">{label}</span>
    </label>
  );
}

function PriceSlider({
  label,
  value,
  min,
  max,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  onCommit: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm text-brand-muted">
        <span>{label}</span>
        <b className="text-brand-teal-900">${value.toLocaleString()}{value === 8000 ? "+" : ""}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onBlur={onCommit}
        onKeyUp={onCommit}
        className="h-2 w-full cursor-pointer accent-brand-teal-700"
      />
    </label>
  );
}
