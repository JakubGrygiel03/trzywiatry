import { EMAIL_TEMPLATES, type EmailTemplateKey } from "@/lib/email/catalog";
import { saveAtelierSnapshot } from "@/lib/data/atelier-persist";
import { runtimeStore } from "@/lib/data/runtime-store";

export type EmailTemplateDraft = {
  subject: string;
  body: string;
};

export function getEmailTemplate(key: EmailTemplateKey): EmailTemplateDraft {
  const seed = EMAIL_TEMPLATES[key];
  const override = runtimeStore.emailTemplates?.[key];
  return {
    subject: override?.subject?.trim() || seed.subject,
    body: override?.body?.trim() || seed.body,
  };
}

export async function updateEmailTemplate(key: EmailTemplateKey, draft: EmailTemplateDraft) {
  runtimeStore.emailTemplates = {
    ...(runtimeStore.emailTemplates ?? {}),
    [key]: {
      subject: draft.subject.trim() || EMAIL_TEMPLATES[key].subject,
      body: draft.body.trim() || EMAIL_TEMPLATES[key].body,
    },
  };
  await saveAtelierSnapshot();
  return getEmailTemplate(key);
}

export async function resetEmailTemplate(key: EmailTemplateKey) {
  const next = { ...(runtimeStore.emailTemplates ?? {}) };
  delete next[key];
  runtimeStore.emailTemplates = next;
  await saveAtelierSnapshot();
  return getEmailTemplate(key);
}
