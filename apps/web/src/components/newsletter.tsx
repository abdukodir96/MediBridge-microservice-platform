"use client";

import { FormEvent, useState } from "react";
import Swal from "sweetalert2";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

export function Newsletter() {
  const [email, setEmail] = useState("");

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      await Swal.fire({
        icon: "warning",
        title: "Please enter a valid email",
        text: "Check your email address and try again.",
        confirmButtonColor: "#125453",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Thanks for subscribing!",
      text: `MediBridge updates will be sent to ${normalizedEmail}.`,
      confirmButtonColor: "#125453",
      timer: 2200,
      showConfirmButton: false,
    });
    setEmail("");
  };

  return (
    <section className="relative w-full overflow-hidden border-y border-brand-line bg-linear-to-br from-brand-cream via-white to-brand-teal-100 px-6 py-20 text-brand-teal-900 shadow-[0_-12px_30px_-24px_rgba(13,59,59,0.35)] sm:px-10 sm:py-24 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 -top-32 h-72 w-72 rounded-full bg-brand-teal-500/16 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 -right-20 h-80 w-80 rounded-full bg-brand-gold/25 blur-2xl"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col items-center text-center">
          <span className="rounded-full border border-brand-teal-500/25 bg-brand-teal-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-teal-700">
            MediBridge updates
          </span>
          <h2 className="mt-5 font-serif text-4xl font-semibold tracking-tight sm:text-[46px]">
            Stay inspired for your care journey
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted sm:text-base">
            Be the first to discover trusted clinics, treatment guides, patient
            stories, and exclusive MediBridge updates.
          </p>

          <form
            onSubmit={subscribe}
            noValidate
            className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="min-h-14 min-w-0 flex-1 rounded-xl border border-brand-line bg-white px-5 text-base text-brand-ink shadow-sm outline-none transition placeholder:text-brand-muted/65 focus:border-brand-teal-500 focus:ring-3 focus:ring-brand-teal-100"
            />
            <button
              type="submit"
              className="group flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gold px-7 text-sm font-bold text-brand-teal-900 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-soft hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
            >
              Subscribe
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              >
                <path
                  d="M19 12H5m14 0-4 4m4-4-4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <p className="mt-5 max-w-xl text-center text-xs leading-5 text-brand-muted/80">
            By subscribing, you agree to our Privacy Policy and consent to
            receive MediBridge news and updates.
          </p>
        </div>
    </section>
  );
}
