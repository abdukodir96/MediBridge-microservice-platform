import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Deliberately thin — <html>/<body>/Providers/fonts all live in the shared
// root layout (app/layout.tsx), which already reads the locale itself via
// getLocale(). This layout's only job is to validate the URL's locale
// segment and enable static rendering for this subtree.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  return children;
}
