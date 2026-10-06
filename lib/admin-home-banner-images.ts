import "server-only";
import { persistAdminImageFile } from "@/lib/admin-library";

export const HOME_BANNER_UPLOAD_DIR = "public/brand/photos/home/banner";
export const HOME_BANNER_UPLOAD_URL_PREFIX = "/brand/photos/home/banner/";
export const HOME_BANNER_UPLOAD_FOLDER = "home-banner";
export const MAX_HOME_BANNER_IMAGE_BYTES = 5 * 1024 * 1024;

/** Homepage banner uses the same library as products and CMS. */
export async function saveHomeBannerImageUpload(file: File): Promise<string> {
  return persistAdminImageFile(file, MAX_HOME_BANNER_IMAGE_BYTES);
}
