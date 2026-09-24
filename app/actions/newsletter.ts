"use server";

import { newsletterSchema } from "@/lib/validations/forms";
import { addSubscriber } from "@/lib/mailerlite";
import { saveAtelierSnapshot, ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import {
  issueOrReuseNewsletterCoupon,
  markNewsletterWelcomeFailed,
  markNewsletterWelcomeSent,
  rememberNewsletterEmail,
  shouldSendNewsletterWelcome,
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
  const isNewOnList = rememberNewsletterEmail(email);
  await saveAtelierSnapshot();
  if (isNewOnList) {
    await addSubscriber(email, "footer_discount_15");
  }

  if (!minted && coupon.isUsed) {
    return {
      ok: true,
      message: "Ten adres jest już na liście. Kod rabatowy został wcześniej wykorzystany.",
    };
  }

  if (!shouldSendNewsletterWelcome(coupon, minted)) {
    return {
      ok: true,
      message:
        "Ten adres jest już na liście. Kod rabatowy poszedł wcześniej mailem — sprawdź skrzynkę i folder spam.",
    };
  }

  // Stamp before Resend so a second click cannot queue the same mail.
  markNewsletterWelcomeSent(email);
  await saveAtelierSnapshot();

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
    markNewsletterWelcomeFailed(email);
    await saveAtelierSnapshot();
    return {
      ok: false,
      message:
        "Zapisaliśmy adres, ale kod rabatowy nie wyszedł mailem. Napisz do pracowni albo spróbuj za chwilę.",
    };
  }

  return {
    ok: true,
    message: "Kod rabatowy jest w drodze mailem. Sprawdź skrzynkę.",
  };
}
