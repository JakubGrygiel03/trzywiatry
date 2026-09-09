"use server";

import { newsletterSchema } from "@/lib/validations/forms";
import { addSubscriber } from "@/lib/mailerlite";
import { getRuntimeSettings, runtimeStore } from "@/lib/data/runtime-store";
import { interpolatePromoCode } from "@/lib/data/settings";
import { sendEmail } from "@/lib/resend";

export async function subscribeNewsletter(_: { ok: boolean; message: string }, formData: FormData) {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź e-mail." };
  }

  const settings = getRuntimeSettings();
  const code = (settings.promoCode ?? "").trim() || "WIOSNA";

  runtimeStore.newsletter.push(parsed.data.email);
  await addSubscriber(parsed.data.email, "footer_discount_15");
  await sendEmail({
    to: parsed.data.email,
    subject: `Twój kod ${code} · Trzy Wiatry`,
    html: `<p>Witaj w pracowni. Twój kod rabatowy: <strong>${code}</strong>.</p>`,
  });

  return {
    ok: true,
    message: interpolatePromoCode("Kod {code} jest w drodze. Sprawdź skrzynkę.", code),
  };
}
