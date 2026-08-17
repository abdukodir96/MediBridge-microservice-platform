import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` — the
// exported function itself is still just a request handler (default
// export), unaffected by that rename.
export default createMiddleware(routing);

export const config = {
  // Only the localized, public route tree. Dashboard/admin are
  // deliberately excluded — they're not SEO targets (already kept out of
  // the public nav/sitemap) and stay English-only, unprefixed.
  matcher: ["/", "/(en|zh|ko|ja)/:path*", "/clinics/:path*", "/login", "/signup", "/booking/:path*"],
};
