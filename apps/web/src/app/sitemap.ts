import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";

function localizedPath(path: string, locale: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

function buildAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${BASE_URL}${localizedPath(path, locale)}`;
  }
  languages["x-default"] = `${BASE_URL}${path}`; // unprefixed fallback = English
  return languages;
}

interface ClinicSummary {
  id: string;
  updatedAt: string;
}

// Pages through getClinics rather than assuming everything fits in one
// request — @Max(50) on the backend caps a single page, so anything beyond
// 50 verified clinics needs this loop regardless of today's fixture count
// (27). Not a workaround for current data size, the actual general case.
async function fetchAllVerifiedClinics(): Promise<ClinicSummary[]> {
  const results: ClinicSummary[] = [];
  let page = 1;
  const limit = 50;

  for (;;) {
    const res = await fetch(process.env.NEXT_PUBLIC_GATEWAY_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($input: ClinicsInquiry!) {
          getClinics(input: $input) { total list { _id updatedAt } }
        }`,
        variables: { input: { page, limit } },
      }),
      next: { revalidate: 3600 }, // sitemap regenerates at most once an hour
    });
    const json = (await res.json()) as {
      data: { getClinics: { total: number; list: { _id: string; updatedAt: string }[] } } | null;
      errors?: unknown[];
    };
    if (json.errors || !json.data) break;

    const { list, total } = json.data.getClinics;
    results.push(...list.map((c) => ({ id: c._id, updatedAt: c.updatedAt })));
    if (results.length >= total || list.length === 0) break;
    page++;
  }
  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/clinics", "/login", "/signup"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}${localizedPath(path, locale)}`,
      changeFrequency: path === "/" ? ("weekly" as const) : ("daily" as const),
      priority: path === "/" ? 1.0 : 0.8,
      alternates: { languages: buildAlternates(path) },
    })),
  );

  const clinics = await fetchAllVerifiedClinics();
  const clinicEntries: MetadataRoute.Sitemap = clinics.flatMap((clinic) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}${localizedPath(`/clinics/${clinic.id}`, locale)}`,
      lastModified: clinic.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: { languages: buildAlternates(`/clinics/${clinic.id}`) },
    })),
  );

  return [...staticEntries, ...clinicEntries];
}
