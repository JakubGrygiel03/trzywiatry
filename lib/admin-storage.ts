import "server-only";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hasSupabaseService } from "@/lib/data/supabase-state";
import { createServiceClient } from "@/lib/supabase/service";

export const UPLOAD_BUCKET = "atelier-uploads";

let bucketReady: Promise<boolean> | null = null;

function isServerlessReadonlyFs() {
  const cwd = process.cwd().replaceAll("\\", "/");
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      cwd === "/var/task" ||
      cwd.startsWith("/var/task/"),
  );
}

export function canUploadToCloud() {
  return hasSupabaseService();
}

export function mustUseCloudStorage() {
  return isServerlessReadonlyFs();
}

const CLOUD_REQUIRED =
  "Na serwerze produkcyjnym zdjęcia idą do Supabase Storage. Uzupełnij NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY.";

/** Dev-only write under /public. Never mkdir on Vercel / Lambda. */
export function writeLocalPublicFile(relativeDir: string, filename: string, bytes: Buffer, urlPrefix: string) {
  if (mustUseCloudStorage()) {
    throw new Error(CLOUD_REQUIRED);
  }
  const dir = path.join(process.cwd(), relativeDir);
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, filename), bytes);
  } catch {
    throw new Error(CLOUD_REQUIRED);
  }
  return `${urlPrefix}${filename}`;
}

export function listLocalPublicImages(relativeDir: string, urlPrefix: string): { url: string; label: string }[] {
  try {
    const dir = path.join(process.cwd(), relativeDir);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file))
      .map((file) => ({ url: `${urlPrefix}${file}`, label: file }));
  } catch {
    return [];
  }
}

export async function persistUploadedImage(opts: {
  folder: string;
  filename: string;
  bytes: Buffer;
  contentType: string;
  localDir: string;
  urlPrefix: string;
}): Promise<string> {
  if (canUploadToCloud()) {
    return uploadPublicImage({
      folder: opts.folder,
      filename: opts.filename,
      bytes: opts.bytes,
      contentType: opts.contentType,
    });
  }
  if (mustUseCloudStorage()) {
    throw new Error(CLOUD_REQUIRED);
  }
  return writeLocalPublicFile(opts.localDir, opts.filename, opts.bytes, opts.urlPrefix);
}

async function ensurePublicBucket() {
  if (bucketReady) return bucketReady;
  bucketReady = (async () => {
    const supabase = createServiceClient();
    if (!supabase) return false;
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets?.some((bucket) => bucket.name === UPLOAD_BUCKET)) return true;
    const { error } = await supabase.storage.createBucket(UPLOAD_BUCKET, {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
    });
    if (error && !/already exists|duplicate/i.test(error.message)) {
      console.error("[storage] createBucket", error.message);
      return false;
    }
    return true;
  })();
  return bucketReady;
}

/** Public HTTPS URL in Supabase Storage. Used on Vercel where /public is read-only. */
export async function uploadPublicImage(opts: {
  folder: string;
  filename: string;
  bytes: Buffer;
  contentType: string;
}): Promise<string> {
  const supabase = createServiceClient();
  if (!supabase || !canUploadToCloud()) {
    throw new Error(
      "Brak magazynu zdjęć. Ustaw NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY — na serwerze produkcyjnym nie zapisujemy plików na dysk.",
    );
  }
  const ready = await ensurePublicBucket();
  if (!ready) {
    throw new Error("Nie udało się przygotować magazynu zdjęć w Supabase Storage.");
  }

  const objectPath = `${opts.folder}/${opts.filename}`;
  const { error } = await supabase.storage.from(UPLOAD_BUCKET).upload(objectPath, opts.bytes, {
    contentType: opts.contentType,
    upsert: false,
  });
  if (error) {
    throw new Error(`Nie udało się wgrać zdjęcia: ${error.message}`);
  }

  const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function listPublicImages(folder: string): Promise<{ url: string; label: string }[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase.storage.from(UPLOAD_BUCKET).list(folder, {
    limit: 80,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !data) return [];
  return data
    .filter((item) => item.name && /\.(jpe?g|png|webp|gif)$/i.test(item.name))
    .map((item) => {
      const objectPath = `${folder}/${item.name}`;
      const { data: pub } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(objectPath);
      return { url: pub.publicUrl, label: item.name };
    });
}

export function randomImageName(prefix: string, ext: string) {
  return `${prefix}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
}
