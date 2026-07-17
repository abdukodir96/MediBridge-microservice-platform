import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LikeButton } from "@/components/like-button";
import { ClinicSearchBar } from "@/components/clinic-search-bar";

const clinics = [
  {
    slug: "seoul-line-clinic",
    name: "Seoul Line Clinic",
    location: "Gangnam-gu",
    tags: ["Plastic Surgery", "中文 OK"],
    rating: "4.9",
    reviews: "312",
    price: "$2,400",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    slug: "banobagi-aesthetic",
    name: "Banobagi Aesthetic",
    location: "Sinsa-dong",
    tags: ["Face Contour", "English"],
    rating: "5.0",
    reviews: "489",
    price: "$3,100",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "id-hospital",
    name: "ID Hospital",
    location: "Gangnam-gu",
    tags: ["Plastic Surgery", "日本語 OK"],
    rating: "4.7",
    reviews: "920",
    price: "$2,800",
    gradient: "from-brand-teal-500 to-brand-teal-700",
  },
  {
    slug: "vip-plastic-surgery",
    name: "VIP Plastic Surgery",
    location: "Apgujeong",
    tags: ["Rhinoplasty", "中文 OK"],
    rating: "4.8",
    reviews: "154",
    price: "$2,600",
    gradient: "from-brand-teal-900 to-brand-teal-500",
  },
  {
    slug: "apgujeong-derma-center",
    name: "Apgujeong Derma Center",
    location: "Apgujeong",
    tags: ["Dermatology", "日本語 OK"],
    rating: "4.8",
    reviews: "206",
    price: "$180",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "wonjin-beauty-medical",
    name: "Wonjin Beauty Medical",
    location: "Sinsa-dong",
    tags: ["Rhinoplasty", "English"],
    rating: "4.9",
    reviews: "271",
    price: "$2,900",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
];

const specialties = [
  { label: "Plastic Surgery", defaultChecked: true },
  { label: "Dermatology", defaultChecked: false },
  { label: "Dental", defaultChecked: false },
  { label: "Hair Transplant", defaultChecked: false },
];

const languages = [
  { label: "中文 (Chinese)", defaultChecked: true },
  { label: "日本語 (Japanese)", defaultChecked: false },
  { label: "English", defaultChecked: true },
];

function Checkbox({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <label className="mb-1.5 flex w-full cursor-pointer items-center gap-[12.5px] rounded-lg px-3 py-2.5 text-[17.5px] text-brand-ink last:mb-0 hover:bg-brand-cream">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 shrink-0 rounded border-brand-line text-brand-teal-700 accent-brand-teal-700"
      />
      <span className="flex-1">{label}</span>
    </label>
  );
}

type ClinicsPageProps = {
  searchParams: Promise<{
    treatment?: string;
    city?: string;
    language?: string;
  }>;
};

export default async function ClinicsPage({ searchParams }: ClinicsPageProps) {
  const params = await searchParams;
  const treatment = params.treatment ?? "";
  const city = params.city ?? "";
  const language = params.language ?? "";
  const languageToken = language === "Chinese" ? "中文" : language === "Japanese" ? "日本語" : language;

  const filteredClinics = clinics.filter((clinic) => {
    const matchesTreatment = !treatment || clinic.tags.includes(treatment);
    const matchesCity = !city || clinic.location === city;
    const matchesLanguage = !languageToken || clinic.tags.some((tag) => tag.includes(languageToken));
    return matchesTreatment && matchesCity && matchesLanguage;
  });

  const resultContext = [city || "Seoul", treatment, language].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-1 flex-col bg-white">
      <SiteHeader active="Find Clinics" />

      {/* SEARCH BAR */}
      <div className="border-b border-brand-line bg-brand-cream px-6 py-5 sm:px-10">
        <ClinicSearchBar
          variant="compact"
          initialTreatment={treatment}
          initialCity={city}
          initialLanguage={language}
        />
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* FILTERS SIDEBAR */}
        <aside className="shrink-0 border-b border-brand-line p-6 lg:w-70 lg:border-b-0 lg:border-r">
          <div className="mb-6.25 flex items-center justify-between">
            <h4 className="text-[17.5px] font-bold text-brand-ink">Filters</h4>
            <button className="text-[15px] font-semibold text-brand-teal-500">Clear all</button>
          </div>

          <div className="mb-6.25 border-b border-brand-line pb-6.25">
            <div className="mb-3.75 text-[15px] font-semibold uppercase tracking-wide text-brand-muted">Specialty</div>
            {specialties.map((s) => (
              <Checkbox key={s.label} label={s.label} defaultChecked={s.defaultChecked} />
            ))}
          </div>

          <div className="mb-6.25 border-b border-brand-line pb-6.25">
            <div className="mb-3.75 text-[15px] font-semibold uppercase tracking-wide text-brand-muted">Price range (USD)</div>
            <div className="relative my-5 h-1.5 rounded-full bg-brand-line">
              <div className="absolute inset-y-0 left-[15%] right-[35%] rounded-full bg-brand-teal-500" />
              <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-brand-teal-700 bg-white" style={{ left: "15%" }} />
              <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-brand-teal-700 bg-white" style={{ left: "65%" }} />
            </div>
            <div className="flex justify-between text-[15px] text-brand-muted">
              <span>$500</span>
              <span>$8,000+</span>
            </div>
          </div>

          <div>
            <div className="mb-3.75 text-[15px] font-semibold uppercase tracking-wide text-brand-muted">Language support</div>
            {languages.map((l) => (
              <Checkbox key={l.label} label={l.label} defaultChecked={l.defaultChecked} />
            ))}
          </div>
        </aside>

        {/* RESULTS */}
        <main className="flex-1 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="text-sm text-brand-muted">
              <b className="text-brand-ink">{filteredClinics.length} clinics</b>{resultContext ? ` in ${resultContext}` : ""}
            </div>
            <button className="rounded-lg border border-brand-line px-3.5 py-2 text-sm font-semibold text-brand-ink">
              Sort: Top rated ▾
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {filteredClinics.map((clinic) => (
              <div
                key={clinic.slug}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-teal-500 hover:shadow-xl hover:shadow-brand-teal-900/10"
              >
                <div className={`relative h-64 bg-linear-to-br ${clinic.gradient}`}>
                  <Link href={`/clinics/${clinic.slug}`} className="absolute inset-0" aria-label={clinic.name} />
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-teal-700">
                    ✓ Verified
                  </span>
                  <LikeButton />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/clinics/${clinic.slug}`} className="mb-2 block text-xl font-bold text-brand-ink hover:text-brand-teal-700">
                    {clinic.name}
                  </Link>
                  <div className="mb-5 flex items-center gap-1.5 text-base text-brand-muted">
                    📍 {clinic.location}
                  </div>
                  <div className="mb-7 flex flex-1 flex-wrap items-start gap-2">
                    {clinic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-teal-100 px-3 py-1 text-sm font-semibold text-brand-teal-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-brand-line pt-4">
                    <span className="flex items-center gap-1.5 text-lg font-bold text-brand-ink">
                      <span className="text-brand-gold">★</span> {clinic.rating}
                      <span className="font-normal text-brand-muted">({clinic.reviews})</span>
                    </span>
                    <span className="text-base text-brand-muted">
                      from <b className="text-brand-teal-900">{clinic.price}</b>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredClinics.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-line bg-brand-cream/40 px-6 py-16 text-center">
              <h2 className="font-serif text-2xl font-semibold text-brand-teal-900">No clinics found</h2>
              <p className="mt-2 text-brand-muted">Try changing one or more search options.</p>
            </div>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
