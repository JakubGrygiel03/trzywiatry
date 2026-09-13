"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { persistContentPage } from "@/lib/data/content-pages";
import { CONTENT_PAGE_META, isContentPageKey, type ContentPageKey } from "@/lib/cms/content-pages";
import { explainContentOverlayIssue, parseContentOverlay } from "@/lib/validations/content-pages";

export async function saveContentPage(formData: FormData) {
  const keyRaw = String(formData.get("pageKey") ?? "");
  if (!isContentPageKey(keyRaw)) {
    redirect("/admin/strony?blad=Nieznana+strona.");
  }
  const key = keyRaw as ContentPageKey;
  const adminHref = CONTENT_PAGE_META[key].adminHref;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(String(formData.get("overlay") ?? "{}"));
  } catch {
    redirect(`${adminHref}?blad=${encodeURIComponent("Nie udało się odczytać nakładki. Odśwież stronę.")}`);
  }

  const issue = explainContentOverlayIssue(key, parsedJson);
  const parsed = parseContentOverlay(key, parsedJson);
  if (issue || !parsed.success) {
    redirect(`${adminHref}?blad=${encodeURIComponent(issue ?? "Sprawdź teksty nakładki.")}`);
  }

  await persistContentPage(key, parsed.data);
  revalidatePath(CONTENT_PAGE_META[key].href);
  revalidatePath(adminHref);
  revalidatePath("/admin/strony");
  redirect(`${adminHref}?zapisano=1`);
}
