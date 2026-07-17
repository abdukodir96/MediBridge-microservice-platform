import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavAuthLinks } from "@/components/nav-auth-links";

const navLinks = [
  { href: "/clinics", label: "Find Clinics" },
  { href: "#", label: "Procedures" },
  { href: "#", label: "How It Works" },
  { href: "#", label: "For Clinics" },
];

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-brand-line px-6 py-4 shadow-[0_8px_16px_-12px_rgba(13,59,59,0.2)] sm:px-10">
      <Logo />
      <nav className="hidden items-center gap-17.5 text-[22.5px] font-medium text-brand-muted lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={
              active === link.label
                ? "font-semibold text-brand-teal-700"
                : "hover:text-brand-teal-700"
            }
          >
            {link.label}
          </Link>
        ))}
        <NavAuthLinks />
      </nav>
      <div className="flex items-center gap-5 sm:gap-6.25">
        <span className="hidden items-center gap-[7.5px] text-[17.5px] font-medium text-brand-muted sm:flex">
          🌐 EN
        </span>
        <Link href="/login" className="text-[17.5px] font-semibold text-brand-teal-700">
          Log in
        </Link>
        <Link
          href="/login"
          className="rounded-[11px] bg-brand-teal-700 px-6.25 py-[12.5px] text-[17.5px] font-semibold text-white hover:bg-brand-teal-900"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
