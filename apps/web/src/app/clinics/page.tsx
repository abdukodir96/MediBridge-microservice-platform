import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { Pagination } from "@/components/pagination";
import { ClinicsFilterPanel, ClinicsSort } from "@/components/clinics-filter-panel";

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
  {
    slug: "jk-plastic-surgery",
    name: "JK Plastic Surgery",
    location: "Gangnam-gu",
    tags: ["Plastic Surgery", "English"],
    rating: "4.9",
    reviews: "438",
    price: "$2,750",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    slug: "toxnfill-dermatology",
    name: "Toxnfill Dermatology",
    location: "Gangnam-gu",
    tags: ["Dermatology", "中文 OK"],
    rating: "4.7",
    reviews: "361",
    price: "$220",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "seoul-dental-hub",
    name: "Seoul Dental Hub",
    location: "Sinsa-dong",
    tags: ["Dental", "English"],
    rating: "4.8",
    reviews: "184",
    price: "$350",
    gradient: "from-brand-teal-500 to-brand-teal-700",
  },
  {
    slug: "forhair-clinic",
    name: "ForHair Clinic",
    location: "Gangnam-gu",
    tags: ["Hair Transplant", "日本語 OK"],
    rating: "4.9",
    reviews: "226",
    price: "$3,400",
    gradient: "from-brand-teal-900 to-brand-teal-500",
  },
  {
    slug: "view-plastic-surgery",
    name: "View Plastic Surgery",
    location: "Gangnam-gu",
    tags: ["Face Contour", "English"],
    rating: "4.8",
    reviews: "517",
    price: "$4,200",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    slug: "dream-medical-center",
    name: "Dream Medical Center",
    location: "Apgujeong",
    tags: ["Rhinoplasty", "中文 OK"],
    rating: "4.7",
    reviews: "298",
    price: "$2,550",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "jy-dermatology",
    name: "JY Dermatology",
    location: "Sinsa-dong",
    tags: ["Dermatology", "日本語 OK"],
    rating: "4.8",
    reviews: "173",
    price: "$195",
    gradient: "from-brand-teal-500 to-brand-teal-700",
  },
  {
    slug: "gangnam-dental-center",
    name: "Gangnam Dental Center",
    location: "Gangnam-gu",
    tags: ["Dental", "English"],
    rating: "4.9",
    reviews: "342",
    price: "$420",
    gradient: "from-brand-teal-900 to-brand-teal-500",
  },
  {
    slug: "motion-hair-clinic",
    name: "Motion Hair Clinic",
    location: "Apgujeong",
    tags: ["Hair Transplant", "English"],
    rating: "4.8",
    reviews: "207",
    price: "$3,250",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    slug: "da-plastic-surgery",
    name: "DA Plastic Surgery",
    location: "Sinsa-dong",
    tags: ["Plastic Surgery", "中文 OK"],
    rating: "4.9",
    reviews: "611",
    price: "$2,950",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "seoul-face-center",
    name: "Seoul Face Center",
    location: "Apgujeong",
    tags: ["Face Contour", "日本語 OK"],
    rating: "4.7",
    reviews: "264",
    price: "$4,800",
    gradient: "from-brand-teal-500 to-brand-teal-700",
  },
  {
    slug: "renew-rhinoplasty",
    name: "Renew Rhinoplasty",
    location: "Gangnam-gu",
    tags: ["Rhinoplasty", "English"],
    rating: "4.8",
    reviews: "193",
    price: "$2,700",
    gradient: "from-brand-teal-900 to-brand-teal-500",
  },
  {
    slug: "oracle-dermatology",
    name: "Oracle Dermatology",
    location: "Gangnam-gu",
    tags: ["Dermatology", "中文 OK"],
    rating: "4.6",
    reviews: "405",
    price: "$160",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    slug: "bright-smile-dental",
    name: "Bright Smile Dental",
    location: "Apgujeong",
    tags: ["Dental", "日本語 OK"],
    rating: "4.9",
    reviews: "218",
    price: "$390",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "maxwell-hair-clinic",
    name: "Maxwell Hair Clinic",
    location: "Gangnam-gu",
    tags: ["Hair Transplant", "English"],
    rating: "4.8",
    reviews: "287",
    price: "$3,600",
    gradient: "from-brand-teal-500 to-brand-teal-700",
  },
  {
    slug: "woori-plastic-surgery",
    name: "Woori Plastic Surgery",
    location: "Sinsa-dong",
    tags: ["Plastic Surgery", "English"],
    rating: "4.7",
    reviews: "352",
    price: "$2,650",
    gradient: "from-brand-teal-900 to-brand-teal-500",
  },
  {
    slug: "reone-dermatology",
    name: "Reone Dermatology",
    location: "Apgujeong",
    tags: ["Dermatology", "中文 OK"],
    rating: "4.8",
    reviews: "149",
    price: "$210",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    slug: "onejin-dental",
    name: "Onejin Dental",
    location: "Gangnam-gu",
    tags: ["Dental", "English"],
    rating: "4.7",
    reviews: "176",
    price: "$330",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
];

const CLINICS_PER_PAGE = 6;

type ClinicsPageProps = {
  searchParams: Promise<{
    treatment?: string;
    city?: string;
    language?: string;
    specialties?: string;
    locations?: string;
    languages?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ClinicsPage({ searchParams }: ClinicsPageProps) {
  const params = await searchParams;
  const selectedSpecialties = parseList(params.specialties ?? params.treatment);
  const selectedLocations = parseList(params.locations ?? params.city);
  const selectedLanguages = parseList(params.languages ?? params.language);
  const minPrice = clampPrice(params.minPrice, 0);
  const maxPrice = clampPrice(params.maxPrice, 8000);
  const sort = ["most-reviewed", "price-low", "price-high"].includes(params.sort ?? "") ? params.sort! : "top-rated";

  const filteredClinics = clinics.filter((clinic) => {
    const price = clinicPrice(clinic.price);
    const matchesSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.some((specialty) => clinic.tags.includes(specialty));
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(clinic.location);
    const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.some((language) => clinic.tags.some((tag) => tag.includes(languageToken(language))));
    return matchesSpecialty && matchesLocation && matchesLanguage && price >= minPrice && price <= maxPrice;
  });

  const sortedClinics = [...filteredClinics].sort((a, b) => {
    if (sort === "price-low") return clinicPrice(a.price) - clinicPrice(b.price);
    if (sort === "price-high") return clinicPrice(b.price) - clinicPrice(a.price);
    if (sort === "most-reviewed") return Number(b.reviews) - Number(a.reviews);
    return Number(b.rating) - Number(a.rating) || Number(b.reviews) - Number(a.reviews);
  });

  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const totalPages = Math.max(1, Math.ceil(sortedClinics.length / CLINICS_PER_PAGE));
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const pageStart = (currentPage - 1) * CLINICS_PER_PAGE;
  const paginatedClinics = sortedClinics.slice(pageStart, pageStart + CLINICS_PER_PAGE);

  const resultContext = [
    selectedLocations.length ? selectedLocations.join(", ") : "Seoul",
    selectedSpecialties.join(", "),
    selectedLanguages.join(", "),
  ].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* FILTERS SIDEBAR */}
        <ClinicsFilterPanel
          key={`${selectedSpecialties.join("|")}-${selectedLocations.join("|")}-${selectedLanguages.join("|")}-${minPrice}-${maxPrice}`}
          specialties={selectedSpecialties}
          languages={selectedLanguages}
          locations={selectedLocations}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        {/* RESULTS */}
        <main className="flex-1 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="text-sm text-brand-muted">
              <b className="text-brand-ink">{filteredClinics.length} clinics</b>{resultContext ? ` in ${resultContext}` : ""}
            </div>
            <ClinicsSort value={sort} />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {paginatedClinics.map((clinic) => (
              <div
                key={clinic.slug}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-teal-500 hover:shadow-xl hover:shadow-brand-teal-900/10"
              >
                <div className={`relative h-64 bg-linear-to-br ${clinic.gradient}`}>
                  <Link href={`/clinics/${clinic.slug}`} className="absolute inset-0" aria-label={clinic.name} />
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-teal-700">
                    ✦ {clinicBadge(clinic)}
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
          {filteredClinics.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              query={{
                specialties: selectedSpecialties.join(","),
                locations: selectedLocations.join(","),
                languages: selectedLanguages.join(","),
                minPrice: minPrice > 0 ? String(minPrice) : "",
                maxPrice: maxPrice < 8000 ? String(maxPrice) : "",
                sort: sort === "top-rated" ? "" : sort,
              }}
            />
          )}
        </main>
      </div>

    </div>
  );
}

function parseList(value?: string) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function clampPrice(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(8000, Math.max(0, parsed)) : fallback;
}

function clinicPrice(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}

function languageToken(language: string) {
  if (language === "Chinese") return "中文";
  if (language === "Japanese") return "日本語";
  return language;
}

function clinicBadge(clinic: (typeof clinics)[number]) {
  if (Number(clinic.rating) >= 4.9) return "Top Rated";
  if (Number(clinic.reviews) >= 400) return "Patient Choice";
  if (clinicPrice(clinic.price) <= 400) return "Best Value";
  if (clinic.tags.includes("Hair Transplant")) return "Specialist";
  if (clinic.tags.includes("English")) return "International Friendly";
  return "Popular";
}
