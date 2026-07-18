"use client";

import { Logo } from "@/components/logo";
import { useChromeHidden } from "@/components/chrome-visibility";

export function SiteFooter() {
  const hidden = useChromeHidden();

  if (hidden) return null;

  return (
    <footer className="relative z-10 flex flex-col gap-12.5 border-t border-brand-line bg-background px-7.5 pb-12.5 pt-[75px] shadow-[0_-6px_20px_-18px_rgba(13,59,59,0.18)] sm:px-12.5 md:flex-row md:justify-between">
      <div>
        <Logo />
        <p className="mt-[12.5px] max-w-70 text-[16.25px] text-brand-muted">
          The trusted bridge between international patients and Korea&apos;s best clinics.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-12.5 sm:grid-cols-3">
        <div>
          <h5 className="mb-[12.5px] text-[15px] uppercase tracking-wide text-brand-muted">Patients</h5>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">Find clinics</a>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">How it works</a>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">Safety & escrow</a>
        </div>
        <div>
          <h5 className="mb-[12.5px] text-[15px] uppercase tracking-wide text-brand-muted">Clinics</h5>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">List your clinic</a>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">Partner login</a>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">Pricing</a>
        </div>
        <div>
          <h5 className="mb-[12.5px] text-[15px] uppercase tracking-wide text-brand-muted">Company</h5>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">About</a>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">Contact</a>
          <a href="#" className="mb-[7.5px] block text-[17.5px] text-brand-ink hover:text-brand-teal-700">Trust & Safety</a>
        </div>
      </div>
    </footer>
  );
}
