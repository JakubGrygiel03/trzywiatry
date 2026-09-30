import { SITE } from "@/lib/constants";

function stripSlash(url: string) {
  return url.replace(/\/$/, "");
}

/** Canonical shop host — never a Vercel preview URL in production. */
export function getPublicSiteUrl() {
  const canonical = stripSlash(SITE.url);
  const fromEnv = stripSlash(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (!fromEnv) return canonical;

  try {
    const host = new URL(fromEnv).hostname;
    if (host === "localhost" || host === "127.0.0.1") return canonical;
    if (host.endsWith(".vercel.app") && process.env.VERCEL_ENV !== "preview") {
      return canonical;
    }
  } catch {
    return canonical;
  }

  return fromEnv;
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getPublicSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
