import "server-only";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/lib/admin-product-constants";
import {
  canUploadToCloud,
  listPublicImages,
  mustUseCloudStorage,
  randomImageName,
  uploadPublicImage,
} from "@/lib/admin-storage";
import { PRODUCT_IMAGE_OPTIONS } from "@/lib/constants";

export { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES };

export const PRODUCT_UPLOAD_DIR = "public/brand/photos/products/uploads";
export const PRODUCT_UPLOAD_URL_PREFIX = "/brand/photos/products/uploads/";
export const PRODUCT_UPLOAD_FOLDER = "products";

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

function localUploadLibrary(): AdminImageOption[] {
  const uploads: AdminImageOption[] = [];
  const dir = path.join(process.cwd(), PRODUCT_UPLOAD_DIR);
  if (!existsSync(dir)) return uploads;
  for (const file of readdirSync(dir)) {
    if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) continue;
    uploads.push({ url: `${PRODUCT_UPLOAD_URL_PREFIX}${file}`, label: file });
  }
  uploads.sort((a, b) => b.label.localeCompare(a.label));
  return uploads;
}

export async function getAdminProductImageLibrary(): Promise<AdminImageOption[]> {
  const cloud = await listPublicImages(PRODUCT_UPLOAD_FOLDER);
  const uploads = [...cloud, ...localUploadLibrary()];
  const seen = new Set<string>();
  const unique = uploads.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  const presets: AdminImageOption[] = PRODUCT_IMAGE_OPTIONS.map((option) => ({
    url: option.value,
    label: option.label,
  }));

  return [...unique, ...presets];
}

async function persistProductFile(file: File, slugPart: string): Promise<string> {
  const ext = extForMime(file.type);
  const name = randomImageName(slugPart, ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (canUploadToCloud()) {
    return uploadPublicImage({
      folder: PRODUCT_UPLOAD_FOLDER,
      filename: name,
      bytes: buffer,
      contentType: file.type,
    });
  }

  if (mustUseCloudStorage()) {
    throw new Error(
      "Na serwerze produkcyjnym zdjęcia idą do Supabase Storage. Uzupełnij klucze Supabase w środowisku.",
    );
  }

  const dir = path.join(process.cwd(), PRODUCT_UPLOAD_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), buffer);
  return `${PRODUCT_UPLOAD_URL_PREFIX}${name}`;
}

/** Saves validated product photos to cloud storage (Vercel) or local /public in dev. */
export async function saveProductImageUploads(files: File[], slug: string): Promise<string[]> {
  const saved: string[] = [];
  const slugPart = safeSlugPart(slug) || "produkt";

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`Plik „${file.name}” jest za duży (max 5 MB).`);
    }
    if (!ALLOWED_MIME.has(file.type)) {
      throw new Error(`Plik „${file.name}” ma niedozwolony format. Użyj JPG, PNG lub WebP.`);
    }
    saved.push(await persistProductFile(file, slugPart));
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
