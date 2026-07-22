"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { NavAuthLinks, useMemberType } from "@/components/nav-auth-links";
import { useChromeHidden } from "@/components/chrome-visibility";
import { useProfileImage } from "@/components/use-profile-image";

const navLinks = [
  { href: "/clinics", label: "Find Clinics" },
  { href: "#", label: "Procedures" },
  { href: "#", label: "How It Works" },
  { href: "#", label: "For Clinics" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const active = pathname.startsWith("/clinics") ? "Find Clinics" : undefined;
  const hidden = useChromeHidden();
  const memberType = useMemberType();
  const memberImage = useProfileImage();
  const isAuthenticated = memberType === "PATIENT" || memberType === "CLINIC";
  const dashboardHref =
    memberType === "CLINIC" ? "/dashboard/clinic" : "/dashboard/patient";

  if (hidden) return null;

  return (
    <header className="relative z-40 flex items-center justify-between border-b border-brand-line bg-background px-6 py-4 shadow-[0_8px_16px_-12px_rgba(13,59,59,0.2)] sm:px-10">
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
        {isAuthenticated ? (
          <Link
            href={dashboardHref}
            aria-label={memberType === "CLINIC" ? "Open My Clinic" : "Open My Page"}
            className="rounded-full transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Image
              src={memberImage}
              alt={memberType === "CLINIC" ? "Clinic profile" : "User profile"}
              width={46}
              height={46}
              className="h-[46px] w-[46px] rounded-full border-2 border-white object-cover shadow-sm"
            />
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-[17.5px] font-semibold text-brand-teal-700"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-[11px] bg-brand-teal-700 px-6.25 py-[12.5px] text-[17.5px] font-semibold text-white hover:bg-brand-teal-900"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
