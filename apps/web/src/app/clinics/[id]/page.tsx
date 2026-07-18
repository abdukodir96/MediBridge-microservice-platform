import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClinicBookingCard } from "@/components/clinic-booking-card";
import { ClinicComments } from "@/components/clinic-comments";
import { ClinicProfileStats } from "@/components/clinic-profile-stats";

const clinicNames: Record<string, string> = {
  "seoul-line-clinic": "Seoul Line Clinic",
  "banobagi-aesthetic": "Banobagi Aesthetic",
  "id-hospital": "ID Hospital",
  "vip-plastic-surgery": "VIP Plastic Surgery",
  "apgujeong-derma-center": "Apgujeong Derma Center",
  "wonjin-beauty-medical": "Wonjin Beauty Medical",
  "jk-plastic-surgery": "JK Plastic Surgery",
  "toxnfill-dermatology": "Toxnfill Dermatology",
  "seoul-dental-hub": "Seoul Dental Hub",
  "forhair-clinic": "ForHair Clinic",
  "view-plastic-surgery": "View Plastic Surgery",
  "dream-medical-center": "Dream Medical Center",
  "jy-dermatology": "JY Dermatology",
  "gangnam-dental-center": "Gangnam Dental Center",
  "motion-hair-clinic": "Motion Hair Clinic",
  "da-plastic-surgery": "DA Plastic Surgery",
  "seoul-face-center": "Seoul Face Center",
  "renew-rhinoplasty": "Renew Rhinoplasty",
  "oracle-dermatology": "Oracle Dermatology",
  "bright-smile-dental": "Bright Smile Dental",
  "maxwell-hair-clinic": "Maxwell Hair Clinic",
  "woori-plastic-surgery": "Woori Plastic Surgery",
  "reone-dermatology": "Reone Dermatology",
  "onejin-dental": "Onejin Dental",
};

const procedures = [
  { name: "Rhinoplasty (nose)", detail: "Surgery + 7 days recovery care", price: "$2,400–3,800" },
  { name: "Double Eyelid Surgery", detail: "Non-incision method available", price: "$1,200–2,000" },
  { name: "Face Contouring (V-line)", detail: "Includes 3D CT consultation", price: "$5,500–7,200" },
];

export default async function ClinicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinicName = clinicNames[id];
  if (!clinicName) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="relative h-[300px] overflow-hidden bg-brand-teal-900 sm:h-[380px]">
        <Image src="/doctor/doctor.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-75" />
        <div className="absolute inset-0 bg-linear-to-r from-brand-teal-900/80 via-brand-teal-700/35 to-brand-teal-900/55" />
        <Link href="/clinics" className="absolute left-5 top-5 z-10 rounded-lg bg-white/95 px-4 py-2 text-sm font-bold text-brand-teal-900 shadow-lg transition hover:bg-white sm:left-8 sm:top-7">
          ‹ Back to results
        </Link>
        <div className="absolute bottom-5 right-5 z-10 flex gap-2 sm:bottom-7 sm:right-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="relative h-14 w-18 overflow-hidden rounded-lg border border-white/60 bg-white/20">
              <Image src="/doctor/doctor.jpg" alt="" fill sizes="72px" className="object-cover" />
            </div>
          ))}
          <div className="flex h-14 w-18 items-center justify-center rounded-lg border border-white/60 bg-brand-teal-900/55 text-xs font-bold text-white">+12</div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-[1540px] gap-9 px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-12">
        <div className="min-w-0">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-teal-500">International patient clinic</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-brand-teal-900 sm:text-5xl">{clinicName}</h1>
            <span className="mt-4 inline-flex rounded-full bg-brand-teal-100 px-3.5 py-1.5 text-xs font-bold text-brand-teal-700">✦ Top Rated on MediBridge</span>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-muted sm:text-base">
              <span className="font-bold text-brand-ink"><span className="text-brand-gold">★</span> 4.9 · 312 reviews</span>
              <span>📍 Gangnam-gu, Seoul</span>
              <span>🗣 中文 · English · 한국어</span>
            </div>
            <ClinicProfileStats clinicSlug={id} />
            <div className="mt-5 flex flex-wrap gap-2">
              {["Plastic Surgery", "Rhinoplasty", "Double Eyelid", "JCI Accredited"].map((tag) => (
                <span key={tag} className="rounded-full bg-brand-teal-100 px-3 py-1.5 text-xs font-semibold text-brand-teal-700">{tag}</span>
              ))}
            </div>
          </header>

          <section className="mt-10">
            <h2 className="font-serif text-2xl font-semibold text-brand-teal-900">About the clinic</h2>
            <p className="mt-4 max-w-4xl text-base leading-8 text-brand-muted">
              Established in 2009 in the heart of Gangnam, {clinicName} specializes in natural-looking facial contouring and rhinoplasty. Board-certified surgeons have treated more than 8,000 international patients, with dedicated Chinese and English coordinators guiding every patient from consultation to recovery.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-2xl font-semibold text-brand-teal-900">Procedures & pricing</h2>
            <div className="mt-4 divide-y divide-brand-line border-y border-brand-line">
              {procedures.map((procedure) => (
                <div key={procedure.name} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-brand-ink">{procedure.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{procedure.detail}</p>
                  </div>
                  <p className="shrink-0 text-right font-bold text-brand-teal-900">{procedure.price}<small className="ml-1 font-normal text-brand-muted">USD</small></p>
                </div>
              ))}
            </div>
          </section>

          <ClinicComments clinicSlug={id} clinicName={clinicName} />
        </div>

        <div className="order-first lg:order-none">
          <ClinicBookingCard clinicSlug={id} clinicName={clinicName} startingPrice="$2,400" />
        </div>
      </main>

    </div>
  );
}
