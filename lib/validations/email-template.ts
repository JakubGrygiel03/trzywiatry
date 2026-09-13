import { z } from "zod";
import { EMAIL_TEMPLATES, isEmailTemplateKey } from "@/lib/email/catalog";
import { missingTokens } from "@/lib/cms/tokens";
import { firstZodMessage, hasUnsafeEmailHtml } from "@/lib/validations/safe-input";

export const emailDraftSchema = z
  .object({
    key: z.string(),
    subject: z.string().trim().min(3, "Temat jest za krótki.").max(140, "Temat: maksymalnie 140 znaków."),
    body: z.string().trim().min(8, "Treść jest za krótka.").max(20000, "Treść maila jest za długa."),
  })
  .superRefine((draft, ctx) => {
    if (!isEmailTemplateKey(draft.key)) {
      ctx.addIssue({ code: "custom", message: "Nieznany szablon maila." });
      return;
    }
    if (hasUnsafeEmailHtml(draft.subject) || hasUnsafeEmailHtml(draft.body)) {
      ctx.addIssue({
        code: "custom",
        message: "W szablonie jest niebezpieczny kod (script, iframe, javascript:). Usuń go.",
      });
    }
    const missing = missingTokens(`${draft.subject}\n${draft.body}`, EMAIL_TEMPLATES[draft.key].tokens);
    if (missing[0]) {
      ctx.addIssue({
        code: "custom",
        message: `Brakuje {${missing[0]}}. Bez klamer każdy klient dostanie pusty albo ten sam tekst.`,
      });
    }
  });

export function explainEmailDraft(input: { key: string; subject: string; body: string }) {
  const parsed = emailDraftSchema.safeParse(input);
  if (parsed.success) return null;
  return firstZodMessage(parsed.error);
}
