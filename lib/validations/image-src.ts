import { z } from "zod";

const LOCAL_PREFIX = /^\/(brand|pwa)\//;

function isSupabasePublicObject(url: URL) {
  return url.hostname.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/public/");
}

/** Local brand files or HTTPS uploads in our bucket — not arbitrary remote URLs. */
export function isAllowedImageSrc(value: string) {
  const src = value.trim();
  if (!src || src.includes("..") || src.includes("\\") || src.includes(" ")) return false;
  if (src.startsWith("/") && !src.startsWith("//") && src.length <= 500) {
    return LOCAL_PREFIX.test(src);
  }
  try {
    const url = new URL(src);
    return url.protocol === "https:" && src.length <= 800 && isSupabasePublicObject(url);
  } catch {
    return false;
  }
}

export const cmsImageSrcSchema = z
  .string()
  .trim()
  .min(1, "Wybierz zdjęcie.")
  .max(800, "Ścieżka zdjęcia jest za długa.")
  .refine(isAllowedImageSrc, "Nieprawidłowa ścieżka zdjęcia.");

export const optionalCmsImageSrcSchema = z
  .string()
  .trim()
  .max(800, "Ścieżka zdjęcia jest za długa.")
  .refine((value) => value === "" || isAllowedImageSrc(value), "Nieprawidłowa ścieżka zdjęcia.");
