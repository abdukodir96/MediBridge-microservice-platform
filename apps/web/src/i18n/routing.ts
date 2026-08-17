import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ko", "ja"],
  defaultLocale: "en",
  // "as-needed" — the default locale (en) gets NO URL prefix (/clinics,
  // not /en/clinics). This is deliberate: the whole app already has
  // hardcoded hrefs like href="/clinics" everywhere (nav links, dashboard
  // sidebars, booking CTAs) — with "as-needed" every one of those keeps
  // working unchanged for English. Only non-default locales need the
  // language switcher to link with a prefix (/zh/clinics).
  localePrefix: "as-needed",
});
