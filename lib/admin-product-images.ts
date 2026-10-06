import "server-only";
import { isDeletableLibraryUrl } from "@/lib/admin-media-delete";
import { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/lib/admin-product-constants";
import { LIBRARY_LOCAL_DIR, LIBRARY_URL_PREFIX, persistAdminImageFile } from "@/lib/admin-library";
import { listLocalPublicImages, listPublicImages, mustUseCloudStorage } from "@/lib/admin-storage";
import { PRODUCT_IMAGE_OPTIONS } from "@/lib/constants";
import { aboutGalleryWorks } from "@/lib/data/gallery";

export { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES };

export const PRODUCT_UPLOAD_DIR = "public/brand/photos/products/uploads";
export const PRODUCT_UPLOAD_URL_PREFIX = "/brand/photos/products/uploads/";
export const PRODUCT_UPLOAD_FOLDER = "products";

export type AdminImageOption = { url: string; label: string; deletable?: boolean };

function mergeLibrary(groups: AdminImageOption[][]): AdminImageOption[] {
  const seen = new Set<string>();
  const unique: AdminImageOption[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      unique.push(item);
    }
  }
  return unique;
}

export async function getAdminProductImageLibrary(): Promise<AdminImageOption[]> {
  const [library, products, cms, gallery, banners, blog] = await Promise.all([
    listPublicImages("library"),
    listPublicImages(PRODUCT_UPLOAD_FOLDER),
    listPublicImages("cms"),
    listPublicImages("gallery"),
    listPublicImages("home-banner"),
    listPublicImages("blog"),
  ]);

  const localUploads = mustUseCloudStorage()
    ? []
    : [
        ...listLocalPublicImages(LIBRARY_LOCAL_DIR, LIBRARY_URL_PREFIX),
        ...listLocalPublicImages(PRODUCT_UPLOAD_DIR, PRODUCT_UPLOAD_URL_PREFIX),
        ...listLocalPublicImages("public/brand/photos/cms/uploads", "/brand/photos/cms/uploads/"),
        ...listLocalPublicImages("public/brand/photos/gallery/uploads", "/brand/photos/gallery/uploads/"),
        ...listLocalPublicImages("public/brand/photos/home/banner", "/brand/photos/home/banner/"),
        ...listLocalPublicImages("public/brand/photos/blog/uploads", "/brand/photos/blog/uploads/"),
      ];

  const uploads = [...library, ...products, ...cms, ...gallery, ...banners, ...blog, ...localUploads];
  uploads.sort((a, b) => b.label.localeCompare(a.label));
  const taggedUploads = uploads.map((item) => ({
    ...item,
    deletable: isDeletableLibraryUrl(item.url),
  }));

  const presets: AdminImageOption[] = [
    ...aboutGalleryWorks.map((work, index) => ({
      url: work.src,
      label: work.alt || `Galeria ${index + 1}`,
    })),
    ...PRODUCT_IMAGE_OPTIONS.map((option) => ({ url: option.value, label: option.label })),
  ];

  return mergeLibrary([taggedUploads, presets]);
}

/** Product photos share the hashed library — picking the same file does not copy it. */
export async function saveProductImageUploads(files: File[], _slug: string): Promise<string[]> {
  const saved: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    saved.push(await persistAdminImageFile(file, MAX_IMAGE_BYTES));
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
