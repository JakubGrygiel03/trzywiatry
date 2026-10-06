import "server-only";
import { persistAdminImageFile } from "@/lib/admin-library";

export const BLOG_UPLOAD_DIR = "public/brand/photos/blog/uploads";
export const BLOG_UPLOAD_URL_PREFIX = "/brand/photos/blog/uploads/";
export const BLOG_UPLOAD_FOLDER = "blog";
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;

/** Blog cover and blocks share the hashed photo library. */
export async function saveBlogImageUpload(file: File): Promise<string> {
  return persistAdminImageFile(file, MAX_BLOG_IMAGE_BYTES);
}
