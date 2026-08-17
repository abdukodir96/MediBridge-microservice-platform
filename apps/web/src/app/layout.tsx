import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "aos/dist/aos.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PageTransition } from "@/components/page-transition";
import { ChromeVisibilityProvider } from "@/components/chrome-visibility";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MediBridge — Your bridge to Korea's trusted clinics",
  description:
    "Compare verified plastic surgery & dermatology clinics in Korea, book with confidence, and pay safely with escrow protection.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolves to the URL's locale under [locale]/... (e.g. /zh/clinics), or
  // the default locale ("en") for every route outside that segment
  // (dashboard, admin) — those never get a locale prefix, so this is
  // exactly the "unlocalized = English" behavior we want, automatically.
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ChromeVisibilityProvider>
              <PageTransition>{children}</PageTransition>
            </ChromeVisibilityProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
