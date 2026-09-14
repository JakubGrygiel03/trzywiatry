import { headers } from "next/headers";
import { getPublicSiteUrl } from "@/lib/site-url";

/** Origin of the current request — reset links must not fall back to WordPress. */
export async function getRequestOrigin() {
  const headerList = await headers();
  const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "")
    .split(",")[0]
    ?.trim();
  if (!host) return getPublicSiteUrl();
  const proto =
    headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
