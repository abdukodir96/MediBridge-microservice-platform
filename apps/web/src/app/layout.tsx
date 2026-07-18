import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "aos/dist/aos.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <SiteHeader />
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
