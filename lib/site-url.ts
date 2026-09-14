import { SITE } from "@/lib/constants";

export function getPublicSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url).replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getPublicSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
