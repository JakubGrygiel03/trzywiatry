import "server-only";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/lib/admin-product-constants";
import { PRODUCT_IMAGE_OPTIONS } from "@/lib/constants";

export { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES };

export const PRODUCT_UPLOAD_DIR = "public/brand/photos/products/uploads";
export const PRODUCT_UPLOAD_URL_PREFIX = "/brand/photos/products/uploads/";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

function safeSlugPart(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export type AdminImageOption = { url: string; label: string };

export function getAdminProductImageLibrary(): AdminImageOption[] {
  const uploads: AdminImageOption[] = [];
  const dir = path.join(process.cwd(), PRODUCT_UPLOAD_DIR);

  if (existsSync(dir)) {
    for (const file of readdirSync(dir)) {
      if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) continue;
      uploads.push({
        url: `${PRODUCT_UPLOAD_URL_PREFIX}${file}`,
        label: file,
      });
    }
  }

  uploads.sort((a, b) => b.label.localeCompare(a.label));

  const presets: AdminImageOption[] = PRODUCT_IMAGE_OPTIONS.map((option) => ({
    url: option.value,
    label: option.label,
  }));

  return [...uploads, ...presets];
}

/** Saves validated product photos under /public/brand/photos/products/uploads/. */
export async function saveProductImageUploads(files: File[], slug: string): Promise<string[]> {
  const saved: string[] = [];
  const dir = path.join(process.cwd(), PRODUCT_UPLOAD_DIR);
  mkdirSync(dir, { recursive: true });

  const slugPart = safeSlugPart(slug) || "produkt";

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`Plik „${file.name}” jest za duży (max 5 MB).`);
    }
    if (!ALLOWED_MIME.has(file.type)) {
      throw new Error(`Plik „${file.name}” ma niedozwolony format. Użyj JPG, PNG lub WebP.`);
    }

    const ext = extForMime(file.type);
    const name = `${slugPart}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(path.join(dir, name), buffer);
    saved.push(`${PRODUCT_UPLOAD_URL_PREFIX}${name}`);
  }

  return saved;
}

export function mergeProductImages(existingUrls: string[], uploadedUrls: string[]) {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const url of [...existingUrls, ...uploadedUrls]) {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    merged.push(trimmed);
    if (merged.length >= MAX_PRODUCT_IMAGES) break;
  }

  return merged;
}
