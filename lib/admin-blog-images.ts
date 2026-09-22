import "server-only";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  canUploadToCloud,
  mustUseCloudStorage,
  randomImageName,
  uploadPublicImage,
} from "@/lib/admin-storage";

export const BLOG_UPLOAD_DIR = "public/brand/photos/blog/uploads";
export const BLOG_UPLOAD_URL_PREFIX = "/brand/photos/blog/uploads/";
export const BLOG_UPLOAD_FOLDER = "blog";
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** Saves one blog image to cloud storage (Vercel) or local /public in dev. */
export async function saveBlogImageUpload(file: File): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Nie wybrano pliku.");
  }
  if (file.size > MAX_BLOG_IMAGE_BYTES) {
    throw new Error("Plik jest za duży (max 5 MB).");
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Dozwolone formaty: JPG, PNG, WebP, GIF.");
  }

  const ext = extForMime(file.type);
  const name = randomImageName("blog", ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (canUploadToCloud()) {
    return uploadPublicImage({
      folder: BLOG_UPLOAD_FOLDER,
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

  const dir = path.join(process.cwd(), BLOG_UPLOAD_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), buffer);
  return `${BLOG_UPLOAD_URL_PREFIX}${name}`;
}
