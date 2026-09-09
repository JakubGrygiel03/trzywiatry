import type { Metadata } from "next";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { Geist, Space_Mono } from "next/font/google";
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
  metadataBase: new URL("https://trzywiatry.pl"),
  applicationName: "Trzy Wiatry",
  manifest: "/manifest.webmanifest",
  title: {
    default: "Trzy Wiatry — ceramika, drewno, warsztaty",
    template: "%s · Trzy Wiatry",
  },
  description:
    "Pracownia Trzy Wiatry: ręcznie toczona ceramika, drewno i warsztaty ceramiczne w Gdańsku. Slow craft, lokalne materiały.",
  themeColor: "#9c644e",
  appleWebApp: {
    capable: true,
    title: "Trzy Wiatry",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Trzy Wiatry",
    description: "Ceramika, drewno i warsztaty. Slow craft z Gdańska.",
    locale: "pl_PL",
    type: "website",
  },
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
