"use server";

import { b2bSchema } from "@/lib/validations/b2b";
import { SITE } from "@/lib/constants";
import { runtimeStore } from "@/lib/data/runtime-store";
import { sendEmail } from "@/lib/resend";
import { escapeHtml } from "@/lib/validations/safe-input";

export async function submitB2BInquiry(_: { ok: boolean; message: string }, formData: FormData) {
  const parsed = b2bSchema.safeParse({
    companyName: formData.get("companyName"),
    nip: formData.get("nip"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    estimatedQuantity: formData.get("estimatedQuantity"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij formularz. / Please complete the form." };
  }

  runtimeStore.b2b.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload: parsed.data,
  });

  await sendEmail({
    to: SITE.email,
    subject: `Zapytanie B2B · ${parsed.data.companyName}`,
    html: `<p>${escapeHtml(parsed.data.contactPerson)} (${escapeHtml(parsed.data.email)}) · NIP/VAT ${escapeHtml(parsed.data.nip || "—")}</p><p>${escapeHtml(parsed.data.message)}</p>`,
  });

  return {
    ok: true,
    message:
      "Dziękujemy. Oddzwonimy z wyceną HoReCa w ciągu dwóch dni roboczych. / Thank you — we will reply with a quote within two working days.",
  };
}
