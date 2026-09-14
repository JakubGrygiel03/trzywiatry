"use server";

import { newsletterSchema } from "@/lib/validations/forms";
import { addSubscriber } from "@/lib/mailerlite";
import { saveAtelierSnapshot, ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getRuntimeSettings, runtimeStore } from "@/lib/data/runtime-store";
import { interpolateStudioCopy } from "@/lib/data/settings";
import { renderEmailTemplate } from "@/lib/email/render";
import { sendEmail } from "@/lib/resend";

export async function subscribeNewsletter(_: { ok: boolean; message: string }, formData: FormData) {
  await ensureAtelierHydrated();
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź e-mail. / Check the email address." };
  }

  const settings = getRuntimeSettings();
  const code = (settings.promoCode ?? "").trim();

  runtimeStore.newsletter.push(parsed.data.email);
  await saveAtelierSnapshot();
  await addSubscriber(parsed.data.email, "footer_discount_15");
  const welcome = renderEmailTemplate("newsletter_welcome", { code: code || "newsletter" });
  const mailed = await sendEmail({
    to: parsed.data.email,
    subject: code ? welcome.subject : "Newsletter · Trzy Wiatry",
    html: welcome.html,
  });

  if (!mailed.ok) {
    return {
      ok: false,
      message:
        "Zapisaliśmy adres, ale kod rabatowy nie wyszedł mailem. Napisz do pracowni albo spróbuj za chwilę. / We saved your address, but the discount email did not send — try again shortly.",
    };
  }

  return {
    ok: true,
    message: code
      ? interpolateStudioCopy("Kod {code} jest w drodze. Sprawdź skrzynkę. / Your code is on the way — check your inbox.", settings)
      : "Jesteś na liście. Sprawdź skrzynkę. / You're on the list — check your inbox.",
  };
}
