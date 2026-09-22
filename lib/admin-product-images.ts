import "server-only";
import { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/lib/admin-product-constants";
import { listLocalPublicImages, listPublicImages, persistUploadedImage, randomImageName } from "@/lib/admin-storage";
import { PRODUCT_IMAGE_OPTIONS } from "@/lib/constants";
import { aboutGalleryWorks } from "@/lib/data/gallery";

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
  const [products, cms, gallery, banners] = await Promise.all([
    listPublicImages(PRODUCT_UPLOAD_FOLDER),
    listPublicImages("cms"),
    listPublicImages("gallery"),
    listPublicImages("home-banner"),
  ]);

  const uploads = [
    ...products,
    ...cms,
    ...gallery,
    ...banners,
    ...listLocalPublicImages(PRODUCT_UPLOAD_DIR, PRODUCT_UPLOAD_URL_PREFIX),
    ...listLocalPublicImages("public/brand/photos/cms/uploads", "/brand/photos/cms/uploads/"),
    ...listLocalPublicImages("public/brand/photos/gallery/uploads", "/brand/photos/gallery/uploads/"),
    ...listLocalPublicImages("public/brand/photos/home/banner", "/brand/photos/home/banner/"),
  ];
  uploads.sort((a, b) => b.label.localeCompare(a.label));

  const presets: AdminImageOption[] = [
    ...aboutGalleryWorks.map((work, index) => ({
      url: work.src,
      label: work.alt || `Galeria ${index + 1}`,
    })),
    ...PRODUCT_IMAGE_OPTIONS.map((option) => ({ url: option.value, label: option.label })),
  ];

  return mergeLibrary([uploads, presets]);
}

async function persistProductFile(file: File, slugPart: string): Promise<string> {
  const name = randomImageName(slugPart, extForMime(file.type));
  const buffer = Buffer.from(await file.arrayBuffer());
  return persistUploadedImage({
    folder: PRODUCT_UPLOAD_FOLDER,
    filename: name,
    bytes: buffer,
    contentType: file.type,
    localDir: PRODUCT_UPLOAD_DIR,
    urlPrefix: PRODUCT_UPLOAD_URL_PREFIX,
  });
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
