import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getPublicSiteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (host.endsWith(".vercel.app")) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const base = getPublicSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/konto/",
          "/api/",
          "/zamowienie",
          "/koszyk",
          "/podglad/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/admin/", "/konto/", "/api/", "/zamowienie", "/koszyk"],
      },
    ],
    sitemap: [`${base}/sitemap.xml`, `${base}/mapa.xml`],
    host: new URL(base).hostname,
  };
}
