import "server-only";
import sharp from "sharp";

/** Keep in sync with scripts/optimize-public-images.mjs */
export const MAX_IMAGE_EDGE = 2400;
const JPEG_QUALITY = 88;
const WEBP_QUALITY = 88;
/** ~6325×6325 — blocks decompression bombs before they fill RAM. */
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_BYTES = 1_500_000;

export type OptimizedUpload = {
  bytes: Buffer;
  contentType: string;
  ext: string;
};

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/**
 * Shrinks admin uploads before they hit disk or Supabase.
 * Photos stay sharp: max 2400px edge, JPEG 88, no upscaling. EXIF is stripped.
 */
export async function optimizeUploadImage(input: Buffer, mime: string): Promise<OptimizedUpload> {
  try {
    const pipeline = sharp(input, { failOn: "none", limitInputPixels: MAX_INPUT_PIXELS }).rotate();
    const meta = await pipeline.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (width * height > MAX_INPUT_PIXELS) {
      throw new Error("Zdjęcie ma za dużą rozdzielczość.");
    }
    const sized =
      width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE
        ? pipeline.resize({
            width: MAX_IMAGE_EDGE,
            height: MAX_IMAGE_EDGE,
            fit: "inside",
            withoutEnlargement: true,
          })
        : pipeline;

    const hasAlpha = Boolean(meta.hasAlpha);
    const pngLooksLikePhoto =
      mime === "image/png" && !hasAlpha && (input.length > 250_000 || width > 1600 || height > 1600);

    let out: Buffer;
    let contentType: string;
    let ext: string;

    if (mime === "image/webp" && hasAlpha) {
      out = await sized.webp({ quality: WEBP_QUALITY }).toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } else if (mime === "image/gif" || mime === "image/webp" || mime === "image/jpeg" || pngLooksLikePhoto) {
      out = await sized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    } else if (mime === "image/png") {
      out = await sized.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
      contentType = "image/png";
      ext = "png";
    } else {
      out = await sized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    }

    if (out.length > MAX_OUTPUT_BYTES) {
      out = await sharp(out, { failOn: "none", limitInputPixels: MAX_INPUT_PIXELS })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    }

    if (out.length >= input.length && mime !== "image/gif") {
      return { bytes: input, contentType: mime, ext: extForMime(mime) };
    }
    return { bytes: out, contentType, ext };
  } catch (error) {
    if (input.length > 400_000) {
      throw error instanceof Error ? error : new Error("Nie udało się skompresować zdjęcia.");
    }
    return { bytes: input, contentType: mime, ext: extForMime(mime) };
  }
}

export function replaceImageExt(filename: string, ext: string) {
  return filename.replace(/\.[^.]+$/, `.${ext}`);
}
