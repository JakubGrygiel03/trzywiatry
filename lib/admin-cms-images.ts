import "server-only";
import { persistUploadedImage, randomImageName } from "@/lib/admin-storage";

export const CMS_FOLDERS = ["cms", "gallery"] as const;
export type CmsUploadFolder = (typeof CMS_FOLDERS)[number];

const FOLDER_META: Record<CmsUploadFolder, { localDir: string; urlPrefix: string; prefix: string }> = {
  cms: {
    localDir: "public/brand/photos/cms/uploads",
    urlPrefix: "/brand/photos/cms/uploads/",
    prefix: "cms",
  },
  gallery: {
    localDir: "public/brand/photos/gallery/uploads",
    urlPrefix: "/brand/photos/gallery/uploads/",
    prefix: "galeria",
  },
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export function isCmsUploadFolder(value: string): value is CmsUploadFolder {
  return (CMS_FOLDERS as readonly string[]).includes(value);
}

/** Immediate admin upload for O nas / kafelki sklepu — cloud on Vercel, /public in dev. */
export async function saveCmsImageUpload(file: File, folder: CmsUploadFolder): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Nie wybrano pliku.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Plik jest za duży (max 5 MB).");
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Dozwolone formaty: JPG, PNG, WebP, GIF.");
  }

  const meta = FOLDER_META[folder];
  const filename = randomImageName(meta.prefix, extForMime(file.type));
  const bytes = Buffer.from(await file.arrayBuffer());

  return persistUploadedImage({
    folder,
    filename,
    bytes,
    contentType: file.type,
    localDir: meta.localDir,
    urlPrefix: meta.urlPrefix,
  });
}
