import "server-only";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { UPLOAD_BUCKET } from "@/lib/admin-storage";
import { createServiceClient } from "@/lib/supabase/service";

const CLOUD_FOLDERS = ["products", "cms", "gallery", "home-banner"] as const;

const LOCAL_PREFIXES = [
  "/brand/photos/products/uploads/",
  "/brand/photos/cms/uploads/",
  "/brand/photos/gallery/uploads/",
  "/brand/photos/home/banner/",
] as const;

function isSafeFilename(name: string) {
  return Boolean(name) && !name.includes("/") && !name.includes("\\") && !name.includes("..") && /\.(jpe?g|png|webp|gif)$/i.test(name);
}

/** Cloud object path `folder/file.jpg` for atelier-uploads public URLs. */
export function cloudObjectPath(url: string): string | null {
  if (!url.startsWith("http://") && !url.startsWith("https://")) return null;
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${UPLOAD_BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    const objectPath = decodeURIComponent(parsed.pathname.slice(idx + marker.length));
    const parts = objectPath.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    const [folder, filename] = parts;
    if (!(CLOUD_FOLDERS as readonly string[]).includes(folder)) return null;
    if (!isSafeFilename(filename)) return null;
    return `${folder}/${filename}`;
  } catch {
    return null;
  }
}

function localUploadAbs(url: string): string | null {
  if (!url.startsWith("/brand/photos/")) return null;
  const prefix = LOCAL_PREFIXES.find((item) => url.startsWith(item));
  if (!prefix) return null;
  const filename = url.slice(prefix.length);
  if (!isSafeFilename(filename)) return null;
  const segments = prefix.split("/").filter(Boolean);
  const abs = path.resolve(process.cwd(), "public", ...segments, filename);
  const root = path.resolve(process.cwd(), "public", "brand", "photos");
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  return abs;
}

export function isDeletableLibraryUrl(url: string) {
  return Boolean(cloudObjectPath(url) || localUploadAbs(url));
}

/** Removes an uploaded file. Brand catalog presets stay. */
export async function deleteUploadedImage(url: string) {
  const trimmed = url.trim();
  const cloud = cloudObjectPath(trimmed);
  if (cloud) {
    const supabase = createServiceClient();
    if (!supabase) {
      throw new Error("Brak połączenia z magazynem zdjęć.");
    }
    const { error } = await supabase.storage.from(UPLOAD_BUCKET).remove([cloud]);
    if (error) {
      throw new Error(`Nie udało się usunąć zdjęcia: ${error.message}`);
    }
    return;
  }

  const local = localUploadAbs(trimmed);
  if (local) {
    if (!existsSync(local)) {
      throw new Error("Plik już nie istnieje.");
    }
    unlinkSync(local);
    return;
  }

  throw new Error("Tego zdjęcia nie można usunąć — należy do katalogu pracowni.");
}
