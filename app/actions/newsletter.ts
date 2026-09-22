"use server";

import { newsletterSchema } from "@/lib/validations/forms";
import { addSubscriber } from "@/lib/mailerlite";
import { saveAtelierSnapshot, ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import {
  issueOrReuseNewsletterCoupon,
  rememberNewsletterEmail,
} from "@/lib/newsletter-coupons";
import { renderEmailTemplate, emailHighlightTile } from "@/lib/email/render";
import { sendEmail } from "@/lib/resend";

export async function subscribeNewsletter(_: { ok: boolean; message: string }, formData: FormData) {
  await ensureAtelierHydrated();
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź e-mail. / Check the email address." };
  }

  const email = parsed.data.email;
  const { coupon, minted } = issueOrReuseNewsletterCoupon(email);
  rememberNewsletterEmail(email);
  await saveAtelierSnapshot();
  await addSubscriber(email, "footer_discount_15");

  if (!minted && coupon.isUsed) {
    return {
      ok: true,
      message:
        "Ten adres jest już na liście. Kod rabatowy został wcześniej wykorzystany. / This address is already subscribed — the discount code was already used.",
    };
  }

  const welcome = renderEmailTemplate("newsletter_welcome", {
    code: coupon.code,
    highlightBlock: emailHighlightTile("Twój jednorazowy kod", coupon.code),
  });
  const mailed = await sendEmail({
    to: email,
    subject: welcome.subject,
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
    message: minted
      ? "Kod rabatowy jest w drodze mailem. Sprawdź skrzynkę. / Your discount code is on its way — check your inbox."
      : "Ten adres jest już na liście — ponownie wysłaliśmy ten sam kod. / Already subscribed — we re-sent the same code.",
  };
}
