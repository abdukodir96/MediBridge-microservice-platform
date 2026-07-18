import Link from "next/link";
import { HideChrome } from "@/components/chrome-visibility";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-10">
      <HideChrome />
      <section className="w-full max-w-[820px] text-center">
        <div className="relative mx-auto h-[340px] w-full bg-[url('/video/bg.gif')] bg-contain bg-center bg-no-repeat sm:h-[460px]">
          <h1 className="absolute inset-x-0 top-2 font-serif text-7xl font-semibold tracking-[0.08em] text-brand-ink sm:top-4 sm:text-8xl">
            404
          </h1>
        </div>

        <div className="relative z-10 -mt-8 sm:-mt-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-teal-500">
            Page not found
          </p>
          <h2 className="font-serif text-3xl font-semibold text-brand-teal-900 sm:text-4xl">
            Looks like you&apos;re lost
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-brand-muted sm:text-base">
            The page you are looking for is not available or may have been moved.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-teal-700 px-7 text-sm font-bold text-white shadow-lg shadow-brand-teal-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-teal-900 hover:shadow-xl active:translate-y-0"
          >
            Go to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
