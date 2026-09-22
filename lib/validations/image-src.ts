import { z } from "zod";

/** Local `/brand/...` paths or HTTPS uploads (Supabase Storage). */
export function isAllowedImageSrc(value: string) {
  const src = value.trim();
  if (!src || src.includes("..") || src.includes("\\") || src.includes(" ")) return false;
  if (src.startsWith("/") && !src.startsWith("//") && src.length <= 500) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && src.length <= 500;
  } catch {
    return false;
  }
}

export const cmsImageSrcSchema = z
  .string()
  .trim()
  .min(1, "Wybierz zdjęcie.")
  .max(500, "Ścieżka zdjęcia jest za długa.")
  .refine(isAllowedImageSrc, "Nieprawidłowa ścieżka zdjęcia.");

export const optionalCmsImageSrcSchema = z
  .string()
  .trim()
  .max(500, "Ścieżka zdjęcia jest za długa.")
  .refine((value) => value === "" || isAllowedImageSrc(value), "Nieprawidłowa ścieżka zdjęcia.");
