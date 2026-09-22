import "server-only";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  canUploadToCloud,
  mustUseCloudStorage,
  randomImageName,
  uploadPublicImage,
} from "@/lib/admin-storage";

export const HOME_BANNER_UPLOAD_DIR = "public/brand/photos/home/banner";
export const HOME_BANNER_UPLOAD_URL_PREFIX = "/brand/photos/home/banner/";
export const HOME_BANNER_UPLOAD_FOLDER = "home-banner";
export const MAX_HOME_BANNER_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Saves one homepage banner image to cloud storage (Vercel) or local /public in dev. */
export async function saveHomeBannerImageUpload(file: File): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Nie wybrano pliku.");
  }
  if (file.size > MAX_HOME_BANNER_IMAGE_BYTES) {
    throw new Error("Plik jest za duży (max 8 MB).");
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Dozwolone formaty: JPG, PNG, WebP.");
  }

  const ext = extForMime(file.type);
  const name = randomImageName("banner", ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (canUploadToCloud()) {
    return uploadPublicImage({
      folder: HOME_BANNER_UPLOAD_FOLDER,
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

  const dir = path.join(process.cwd(), HOME_BANNER_UPLOAD_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), buffer);
  return `${HOME_BANNER_UPLOAD_URL_PREFIX}${name}`;
}
