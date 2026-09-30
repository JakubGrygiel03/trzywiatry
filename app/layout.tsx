import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { P24HandoffOverlay } from "@/components/checkout/p24-handoff-overlay";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { Geist, Space_Mono } from "next/font/google";
import { SITE } from "@/lib/constants";
import { getPublicSiteUrl } from "@/lib/site-url";
import { supabaseOrigin } from "@/lib/supabase-origin";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  title: {
    default: "Trzy Wiatry — ceramika, drewno, warsztaty",
    template: "%s · Trzy Wiatry",
  },
  description: SITE.seoDescription,
  authors: [{ name: SITE.owner, url: getPublicSiteUrl() }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "shopping",
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Trzy Wiatry — ceramika, drewno, warsztaty",
    description: SITE.seoDescription,
    locale: "pl_PL",
    type: "website",
    siteName: SITE.name,
    url: "/",
    images: [{ url: "/brand/logo-nav.png", alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trzy Wiatry — ceramika, drewno, warsztaty",
    description: SITE.seoDescription,
    images: ["/brand/logo-nav.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#9C644E",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const storageOrigin = supabaseOrigin();

  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full w-full max-w-full bg-papier text-czarny">
        {storageOrigin ? (
          <>
            <link rel="preconnect" href={storageOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={storageOrigin} />
          </>
        ) : null}
        <PwaRegister />
        {children}
        <P24HandoffOverlay />
      </body>
    </html>
  );
}
