import Link from "next/link";
import { LikeButton } from "@/components/like-button";

const clinics = [
  {
    name: "Seoul Line Clinic",
    location: "Gangnam-gu, Seoul",
    tags: ["Plastic Surgery", "中文 OK"],
    rating: "4.9",
    reviews: "312",
    price: "$2,400",
    gradient: "from-brand-teal-500 to-brand-teal-900",
  },
  {
    name: "Apgujeong Derma Center",
    location: "Apgujeong, Seoul",
    tags: ["Dermatology", "日本語 OK"],
    rating: "4.8",
    reviews: "206",
    price: "$180",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    name: "Banobagi Aesthetic",
    location: "Sinsa-dong, Seoul",
    tags: ["Face Contour", "English"],
    rating: "5.0",
    reviews: "489",
    price: "$3,100",
    gradient: "from-brand-teal-700 to-brand-teal-900",
  },
  {
    name: "Wonjin Beauty Medical",
    location: "Sinsa-dong, Seoul",
    tags: ["Rhinoplasty", "English"],
    rating: "4.9",
    reviews: "271",
    price: "$2,900",
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

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-brand-teal-900">
      <span className="flex h-6.5 w-6.5 items-center justify-center rounded-[7px] bg-brand-teal-700">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      MediBridge
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* NAV */}
      <header className="flex items-center justify-between border-b border-brand-line px-6 py-4 sm:px-10">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-brand-muted lg:flex">
          <a href="#" className="hover:text-brand-teal-700">Find Clinics</a>
          <a href="#" className="hover:text-brand-teal-700">Procedures</a>
          <a href="#" className="hover:text-brand-teal-700">How It Works</a>
          <a href="#" className="hover:text-brand-teal-700">For Clinics</a>
        </nav>
        <div className="flex items-center gap-4 sm:gap-5">
          <span className="hidden items-center gap-1.5 text-sm font-medium text-brand-muted sm:flex">
            🌐 EN
          </span>
          <Link href="/login" className="text-sm font-semibold text-brand-teal-700">
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-[9px] bg-brand-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-900"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-linear-to-b from-brand-cream to-white px-6 py-14 sm:px-10 sm:py-16">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-brand-teal-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-teal-500">
          ✦ 1.17M+ patients trust Korea every year
        </span>
        <h1 className="mb-4 max-w-xl font-serif text-4xl font-semibold leading-tight tracking-tight text-brand-teal-900 sm:text-5xl sm:leading-[1.1]">
          Your bridge to Korea&apos;s <em className="italic text-brand-gold">trusted</em> clinics.
        </h1>
        <p className="mb-8 max-w-md text-base text-brand-muted sm:text-lg">
          Compare verified plastic surgery & dermatology clinics, book with confidence, and pay
          safely — every step handled in your language.
        </p>

        {/* SEARCH */}
        <div className="mb-10 flex max-w-2xl flex-col divide-y divide-brand-line rounded-2xl border border-brand-line bg-white p-2 shadow-lg shadow-brand-teal-900/5 sm:flex-row sm:divide-x sm:divide-y-0">
          <div className="flex-1 px-4 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Treatment</div>
            <div className="text-sm font-medium text-brand-ink">Rhinoplasty</div>
          </div>
          <div className="flex-1 px-4 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">City</div>
            <div className="text-sm font-medium text-brand-ink">Seoul · Gangnam</div>
          </div>
          <div className="flex-1 px-4 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Language</div>
            <div className="text-sm font-medium text-brand-ink">中文 · English</div>
          </div>
          <button className="mt-2 flex items-center justify-center rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-teal-900 sm:mt-0">
            Search →
          </button>
        </div>

        {/* TRUST */}
        <div className="grid max-w-2xl grid-cols-2 gap-6 border-t border-brand-line pt-7 sm:grid-cols-4 sm:gap-10">
          <div>
            <div className="font-serif text-2xl font-semibold text-brand-teal-900 sm:text-3xl">240+</div>
            <div className="text-xs text-brand-muted sm:text-[12.5px]">Verified clinics</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-brand-teal-900 sm:text-3xl">18K</div>
            <div className="text-xs text-brand-muted sm:text-[12.5px]">Bookings completed</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-brand-teal-900 sm:text-3xl">4.9★</div>
            <div className="text-xs text-brand-muted sm:text-[12.5px]">Avg. patient rating</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-brand-teal-900 sm:text-3xl">100%</div>
            <div className="text-xs text-brand-muted sm:text-[12.5px]">Escrow-protected pay</div>
          </div>
        </div>
      </section>

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
          <a href="#" className="group flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-brand-teal-500">
            View all clinics
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {clinics.map((clinic) => (
            <div key={clinic.name} className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-line bg-white">
              <div className={`relative h-64 bg-linear-to-br ${clinic.gradient}`}>
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-teal-700">
                  ✦ Top Rated
                </span>
                <LikeButton />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1.5 text-base font-bold text-brand-ink">{clinic.name}</div>
                <div className="mb-4 flex items-center gap-1 text-[11px] text-brand-muted">
                  📍 {clinic.location}
                </div>
                <div className="mb-6 flex flex-1 flex-wrap items-start gap-1.5">
                  {clinic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-teal-100 px-2 py-0.5 text-[10px] font-semibold text-brand-teal-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-brand-line pt-3">
                  <span className="flex items-center gap-1 text-xs font-bold text-brand-ink">
                    <span className="text-brand-gold">★</span> {clinic.rating}
                    <span className="font-normal text-brand-muted">({clinic.reviews})</span>
                  </span>
                  <span className="text-xs text-brand-muted">
                    from <b className="text-brand-teal-900">{clinic.price}</b>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-brand-teal-900 px-6 py-12 text-white sm:px-10 sm:py-14">
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
      <div className="relative mx-6 -mt-6 flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-5 shadow-xl shadow-brand-teal-900/10 sm:mx-10 sm:-mt-6.5 sm:flex-row sm:items-center sm:p-6">
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

      {/* FOOTER */}
      <footer className="mt-5 flex flex-col gap-10 border-t border-brand-line px-6 py-10 sm:px-10 md:flex-row md:justify-between">
        <div>
          <Logo />
          <p className="mt-2.5 max-w-56 text-[13px] text-brand-muted">
            The trusted bridge between international patients and Korea&apos;s best clinics.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <h5 className="mb-2.5 text-xs uppercase tracking-wide text-brand-muted">Patients</h5>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">Find clinics</a>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">How it works</a>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">Safety & escrow</a>
          </div>
          <div>
            <h5 className="mb-2.5 text-xs uppercase tracking-wide text-brand-muted">Clinics</h5>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">List your clinic</a>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">Partner login</a>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">Pricing</a>
          </div>
          <div>
            <h5 className="mb-2.5 text-xs uppercase tracking-wide text-brand-muted">Company</h5>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">About</a>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">Contact</a>
            <a href="#" className="mb-1.5 block text-sm text-brand-ink hover:text-brand-teal-700">Trust & Safety</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
