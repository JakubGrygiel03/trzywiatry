import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const BLOG_UPLOAD_DIR = "public/brand/photos/blog/uploads";
export const BLOG_UPLOAD_URL_PREFIX = "/brand/photos/blog/uploads/";
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** Saves one blog image under /public/brand/photos/blog/uploads/. */
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

  const dir = path.join(process.cwd(), BLOG_UPLOAD_DIR);
  mkdirSync(dir, { recursive: true });

  const ext = extForMime(file.type);
  const name = `blog-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(dir, name), buffer);

  return `${BLOG_UPLOAD_URL_PREFIX}${name}`;
}
