// Plain, locale-unaware Next.js navigation — for /dashboard/* and /admin/*
// ONLY. Those route trees live OUTSIDE app/[locale]/..., so `@/i18n/navigation`'s
// wrappers (which blindly prefix any pushed path with the current locale,
// e.g. `/zh/dashboard/patient`, a route that doesn't exist) would 404 them.
//
// Rule of thumb: importing from here says "this path has no locale prefix,
// ever" — a file that needs to navigate to BOTH a [locale] path (/login,
// /clinics, /booking/new) AND a dashboard/admin path can't use either
// wrapper exclusively and needs both, explicitly, side by side.
export { useRouter, usePathname, useSearchParams, redirect } from "next/navigation";
export { default as Link } from "next/link";
