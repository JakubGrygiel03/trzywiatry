import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { Geist, Space_Mono } from "next/font/google";
import { SITE } from "@/lib/constants";
import { getPublicSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  title: {
    default: "Trzy Wiatry — ceramika, drewno, warsztaty",
    template: "%s · Trzy Wiatry",
  },
  description:
    "Pracownia Trzy Wiatry: ręcznie toczona ceramika, drewno i warsztaty ceramiczne w Gdańsku. Slow craft, lokalne materiały.",
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
    description: "Ceramika, drewno i warsztaty. Slow craft z Gdańska.",
    locale: "pl_PL",
    type: "website",
    siteName: SITE.name,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trzy Wiatry — ceramika, drewno, warsztaty",
    description: "Ceramika, drewno i warsztaty. Slow craft z Gdańska.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#9C644E",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-papier text-czarny">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
