"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetEmailTemplate, updateEmailTemplate } from "@/lib/data/email-templates";
import { isEmailTemplateKey } from "@/lib/email/catalog";
import { emailDraftSchema, explainEmailDraft } from "@/lib/validations/email-template";
import { firstZodMessage } from "@/lib/validations/safe-input";

export async function saveEmailTemplate(formData: FormData) {
  const draft = {
    key: String(formData.get("key") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    body: String(formData.get("body") ?? ""),
  };
  const parsed = emailDraftSchema.safeParse(draft);
  if (!parsed.success || !isEmailTemplateKey(parsed.data.key)) {
    const reason =
      explainEmailDraft(draft) ??
      (parsed.success ? "Nieznany szablon maila." : firstZodMessage(parsed.error));
    const target = isEmailTemplateKey(draft.key)
      ? `/admin/emaile/${draft.key}?blad=1&powod=${encodeURIComponent(reason)}`
      : "/admin/emaile?blad=1";
    redirect(target);
  }

  updateEmailTemplate(parsed.data.key, {
    subject: parsed.data.subject,
    body: parsed.data.body,
  });
  revalidatePath("/admin/emaile");
  revalidatePath(`/admin/emaile/${parsed.data.key}`);
  redirect(`/admin/emaile/${parsed.data.key}?zapisano=1`);
}

export async function restoreEmailTemplate(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  if (!isEmailTemplateKey(key)) redirect("/admin/emaile?blad=1");
  resetEmailTemplate(key);
  revalidatePath("/admin/emaile");
  revalidatePath(`/admin/emaile/${key}`);
  redirect(`/admin/emaile/${key}?przywrocono=1`);
}
