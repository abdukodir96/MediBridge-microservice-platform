"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/lib/plain-navigation";

const adminNav = [
  { icon: "🏥", label: "Clinic Review", href: "/admin" },
  { icon: "📋", label: "All Clinics", href: "/admin/clinics" },
  { icon: "💬", label: "Messages", href: "/admin/messages" },
  { icon: "👥", label: "Members", href: null },
  { icon: "📊", label: "Platform Stats", href: null },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("memberEmail"),
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("memberType");
    localStorage.removeItem("memberEmail");
    localStorage.removeItem("memberNick");
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-brand-line bg-brand-teal-900 px-7 py-3.5">
        <div className="flex items-center gap-2.5 font-serif text-lg font-semibold text-white">
          MediBridge
          <span className="rounded-md bg-brand-gold px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-teal-900">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-3.5 text-sm text-brand-teal-100/80">
          <span>{adminEmail}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="h-7 w-7 cursor-pointer rounded-full bg-brand-gold text-xs font-bold text-brand-teal-900"
            aria-label="Log out"
            title="Log out"
          >
            ⎋
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <aside className="w-[210px] shrink-0 border-r border-brand-line bg-brand-cream p-3.5">
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const active = item.href === pathname;
              if (!item.href) {
                return (
                  <span
                    key={item.label}
                    className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-muted/50"
                  >
                    <span className="w-[18px] text-center text-base">{item.icon}</span>
                    {item.label}
                    <span className="ml-auto rounded bg-brand-line px-1.5 py-0.5 text-[8.5px] font-bold text-brand-muted">
                      not built
                    </span>
                  </span>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-brand-teal-900 font-semibold text-white"
                      : "text-brand-muted hover:bg-white"
                  }`}
                >
                  <span className="w-[18px] text-center text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
