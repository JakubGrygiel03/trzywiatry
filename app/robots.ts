import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

/**
 * Static robots — no request headers, so crawlers do not wake a serverless function.
 * Preview deployments stay closed. Production noindex for *.vercel.app is the
 * X-Robots-Tag set in proxy.ts (the canonical host is trzywiatry.pl).
 */
const PRIVATE = [
  "/admin",
  "/konto",
  "/api/",
  "/zamowienie",
  "/koszyk",
  "/podglad/",
  "/sklep/w/",
  "/*pojemnosc=",
  "/*sortuj=",
  "/*cena_od=",
  "/*cena_do=",
  "/*kategoria=",
  "/*domena=",
  "/*strona=",
  "/*?q=",
  "/*&q=",
  "/*token=",
  "/*sessionId",
];

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const base = getPublicSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: "GPTBot", disallow: PRIVATE },
      { userAgent: "ClaudeBot", disallow: PRIVATE },
      { userAgent: "Google-Extended", disallow: PRIVATE },
      { userAgent: "CCBot", disallow: ["/"] },
      { userAgent: "Bytespider", disallow: ["/"] },
      { userAgent: "PetalBot", disallow: ["/"] },
    ],
    sitemap: [`${base}/sitemap.xml`, `${base}/mapa.xml`],
    host: new URL(base).hostname,
  };
}
