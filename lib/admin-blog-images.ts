import "server-only";
import { persistUploadedImage, randomImageName } from "@/lib/admin-storage";

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

  const name = randomImageName("blog", extForMime(file.type));
  const bytes = Buffer.from(await file.arrayBuffer());
  return persistUploadedImage({
    folder: BLOG_UPLOAD_FOLDER,
    filename: name,
    bytes,
    contentType: file.type,
    localDir: BLOG_UPLOAD_DIR,
    urlPrefix: BLOG_UPLOAD_URL_PREFIX,
  });
}
