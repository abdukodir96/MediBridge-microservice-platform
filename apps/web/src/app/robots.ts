import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*", // Googlebot, Baiduspider, Yeti (Naver) all follow this one rule
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/booking/"], // private / login-gated, not SEO targets
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
