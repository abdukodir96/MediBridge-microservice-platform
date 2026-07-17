"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

let aosInitialized = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (isAuthPage) return;

    let active = true;

    const startAos = async () => {
      const { default: AOS } = await import("aos");
      if (!active) return;

      if (!aosInitialized) {
        AOS.init({
          duration: 650,
          easing: "ease-out-cubic",
          offset: 0,
          once: true,
        });
        aosInitialized = true;
      }

      window.requestAnimationFrame(() => AOS.refreshHard());
    };

    void startAos();
    return () => {
      active = false;
    };
  }, [pathname, isAuthPage]);

  return (
    <div
      key={isAuthPage ? "auth" : pathname}
      data-aos={isAuthPage ? undefined : "fade-up"}
      data-aos-duration={isAuthPage ? undefined : "650"}
      className="flex min-h-full flex-1 flex-col"
    >
      {children}
    </div>
  );
}
