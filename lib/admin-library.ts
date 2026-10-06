import "server-only";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  canUploadToCloud,
  mustUseCloudStorage,
  UPLOAD_BUCKET,
  uploadPublicImage,
  writeLocalPublicFile,
} from "@/lib/admin-storage";
import { sniffImageMime } from "@/lib/image-magic";
import { optimizeUploadImage } from "@/lib/optimize-upload-image";
import { createServiceClient } from "@/lib/supabase/service";

/** One folder for every admin upload — home, blog, product and gallery share it. */
export const LIBRARY_FOLDER = "library";
export const LIBRARY_LOCAL_DIR = "public/brand/photos/library";
export const LIBRARY_URL_PREFIX = "/brand/photos/library/";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_STORED_BYTES = 1_500_000;
const CLOUD_REQUIRED =
  "Na serwerze produkcyjnym zdjęcia idą do Supabase Storage. Uzupełnij NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY.";

function contentName(bytes: Buffer, ext: string) {
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 20);
  return `${hash}.${ext}`;
}

function publicCloudUrl(filename: string) {
  const supabase = createServiceClient();
  if (!supabase) return null;
  return supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(`${LIBRARY_FOLDER}/${filename}`).data.publicUrl;
}

/**
 * Validates, shrinks, and stores once. Same bytes → same URL (no per-section copies).
 */
export async function persistAdminImageFile(file: File, maxBytes = MAX_UPLOAD_BYTES): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Nie wybrano pliku.");
  }
  if (file.size > maxBytes) {
    throw new Error(`Plik jest za duży (max ${Math.round(maxBytes / (1024 * 1024))} MB).`);
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageMime(raw);
  if (!sniffed) {
    throw new Error("To nie jest zdjęcie (JPG, PNG, WebP lub GIF).");
  }

  const optimized = await optimizeUploadImage(raw, sniffed);
  if (optimized.bytes.length > MAX_STORED_BYTES) {
    throw new Error("Zdjęcie jest nadal za ciężkie po kompresji. Wgraj mniejsze ujęcie.");
  }

  const filename = contentName(optimized.bytes, optimized.ext);
  const localUrl = `${LIBRARY_URL_PREFIX}${filename}`;

  if (canUploadToCloud()) {
    try {
      return await uploadPublicImage({
        folder: LIBRARY_FOLDER,
        filename,
        bytes: optimized.bytes,
        contentType: optimized.contentType,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/exists|duplicate|already/i.test(message)) {
        const reused = publicCloudUrl(filename);
        if (reused) return reused;
      }
      throw error;
    }
  }

  if (mustUseCloudStorage()) {
    throw new Error(CLOUD_REQUIRED);
  }

  if (existsSync(path.join(process.cwd(), LIBRARY_LOCAL_DIR, filename))) {
    return localUrl;
  }
  return writeLocalPublicFile(LIBRARY_LOCAL_DIR, filename, optimized.bytes, LIBRARY_URL_PREFIX);
}
