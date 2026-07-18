import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { TrustStats } from "@/components/trust-stats";
import { ClinicSearchBar } from "@/components/clinic-search-bar";
import { Testimonials } from "@/components/testimonials";

const clinics = [
  {
    slug: "seoul-line-clinic",
    name: "Seoul Line Clinic",
    location: "Gangnam-gu, Seoul",
    tags: ["Plastic Surgery", "中文 OK"],
    rating: "4.9",
    reviews: "312",
    price: "$2,400",
    badge: "Top Rated",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    slug: "apgujeong-derma-center",
    name: "Apgujeong Derma Center",
    location: "Apgujeong, Seoul",
    tags: ["Dermatology", "日本語 OK"],
    rating: "4.8",
    reviews: "206",
    price: "$180",
    badge: "Best Value",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "banobagi-aesthetic",
    name: "Banobagi Aesthetic",
    location: "Sinsa-dong, Seoul",
    tags: ["Face Contour", "English"],
    rating: "5.0",
    reviews: "489",
    price: "$3,100",
    badge: "Patient Choice",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    slug: "wonjin-beauty-medical",
    name: "Wonjin Beauty Medical",
    location: "Sinsa-dong, Seoul",
    tags: ["Rhinoplasty", "English"],
    rating: "4.9",
    reviews: "271",
    price: "$2,900",
    badge: "International Friendly",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
];

const steps = [
  {
    title: "Discover",
    description: "Search verified clinics by treatment, price and language.",
  },
  {
    title: "Consult",
    description: "Chat directly with clinics — auto-translated, docs shared securely.",
  },
  {
    title: "Book & Pay",
    description: "Confirm your date. Funds held safely in escrow until treatment.",
  },
  {
    title: "Fly & Heal",
    description: "Arrive, get treated, and release payment only when satisfied.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* HERO */}
      <section className="relative isolate min-h-[calc(100svh-78px)] overflow-hidden px-6 py-16 sm:px-10 sm:py-20">
        <Image
          src="/doctor/doctor.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 scale-[1.01] object-cover object-center"
          aria-hidden="true"
        />

        <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-brand-teal-100 px-5 py-2.5 text-base font-semibold uppercase tracking-wider text-brand-teal-500">
          ✦ 1.17M+ patients trust Korea every year
        </span>
        <h1 className="mb-7 max-w-4xl font-serif text-[64px] font-semibold leading-[1.08] tracking-tight text-brand-teal-900 sm:text-[78px]">
          Your bridge to Korea&apos;s <em className="italic text-brand-gold">trusted</em> clinics.
        </h1>
        <p className="mb-14 max-w-3xl text-[22px] leading-relaxed text-brand-muted sm:text-[27px]">
          Compare verified plastic surgery & dermatology clinics, book with confidence, and pay
          safely — every step handled in your language.
        </p>

        {/* SEARCH */}
        <ClinicSearchBar />
      </section>

      <TrustStats />

      {/* FEATURED CLINICS */}
      <section className="px-6 py-12 sm:px-10 sm:py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-brand-teal-900 sm:text-[30px]">
              Featured clinics
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Hand-verified by our medical team · updated weekly
            </p>
          </div>
          <Link href="/clinics" className="group flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-brand-teal-500">
            View all clinics
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {clinics.map((clinic) => (
            <div key={clinic.name} className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-teal-500 hover:shadow-xl hover:shadow-brand-teal-900/10">
              <div className={`relative h-64 bg-linear-to-br ${clinic.gradient}`}>
                <Link href={`/clinics/${clinic.slug}`} className="absolute inset-0" aria-label={clinic.name} />
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-teal-700">
                  ✦ {clinic.badge}
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
      </section>

      <Testimonials />

      {/* HOW IT WORKS */}
      <section className="relative z-10 bg-brand-teal-900 px-6 py-12 text-white shadow-[0_-8px_16px_-12px_rgba(13,59,59,0.3)] sm:px-10 sm:py-14">
        <h2 className="mb-2 font-serif text-2xl font-semibold sm:text-[30px]">How MediBridge works</h2>
        <p className="mb-8 max-w-md text-sm text-brand-teal-100/75">
          From your first question to your recovery flight home — one platform, one trusted process.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title}>
              <div className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-[9px] bg-brand-gold font-serif text-[15px] font-semibold text-brand-teal-900">
                {i + 1}
              </div>
              <h3 className="mb-1.5 text-base font-semibold">{step.title}</h3>
              <p className="text-[13px] text-brand-teal-100/70">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ESCROW STRIP */}
      <div className="relative z-20 mx-6 -mt-6 flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-5 shadow-xl shadow-brand-teal-900/10 sm:mx-10 sm:-mt-6.5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-brand-teal-100">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"
              stroke="#125453"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M9 12l2 2 4-4" stroke="#c9a24b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h4 className="mb-0.5 text-[15px] font-bold text-brand-teal-900">
            Your money is protected until you&apos;re treated
          </h4>
          <p className="text-[13px] text-brand-muted">
            Payments are held in secure escrow and only released to the clinic after your procedure
            is confirmed complete.
          </p>
        </div>
        <a href="#" className="whitespace-nowrap text-[13px] font-semibold text-brand-teal-700 sm:ml-auto">
          How escrow works →
        </a>
      </div>

    </div>
  );
}
