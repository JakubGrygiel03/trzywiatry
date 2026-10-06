import "server-only";
import { persistAdminImageFile } from "@/lib/admin-library";

export const CMS_FOLDERS = ["cms", "gallery"] as const;
export type CmsUploadFolder = (typeof CMS_FOLDERS)[number];

export function isCmsUploadFolder(value: string): value is CmsUploadFolder {
  return (CMS_FOLDERS as readonly string[]).includes(value);
}

/** Home / kafelki / galeria — one hashed library, not a copy per section. */
export async function saveCmsImageUpload(file: File, _folder: CmsUploadFolder): Promise<string> {
  return persistAdminImageFile(file);
}
