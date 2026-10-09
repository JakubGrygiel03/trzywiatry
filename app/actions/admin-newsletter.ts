"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/admin-auth";
import { assertAdminSession } from "@/lib/admin-guard";
import { withCmsTick } from "@/lib/cms-redirect";
import { ensureAtelierHydrated, flushAtelierSave, markNewsletterListAuthoritative } from "@/lib/data/atelier-persist";
import { getRuntimeSettings, updateRuntimeSettings } from "@/lib/data/runtime-store";
import { newsletterDiscountPercentSchema } from "@/lib/validations/settings";
import { newsletterBroadcastHtml } from "@/lib/email/newsletter-broadcast";
import { rebindNewsletterCouponEmail } from "@/lib/newsletter-coupons";
import {
  listConsentingNewsletterSubscribers,
  removeNewsletterEmail,
  updateNewsletterSubscriber,
} from "@/lib/newsletter-subscribers";
import { sendEmail } from "@/lib/resend";
import { studioIdentity } from "@/lib/studio-identity";
import { emailSchema, firstZodMessage } from "@/lib/validations/safe-input";
import { newsletterBroadcastSchema } from "@/lib/validations/forms";

const SEND_CHUNK = 4;

export type BroadcastState = {
  ok: boolean;
  message?: string;
  subject?: string;
  body?: string;
  sent?: number;
};

export type SubscriberSaveState = {
  ok: boolean;
  message?: string;
};

function fail(message: string): never {
  redirect(withCmsTick(`/admin/newsletter?blad=${encodeURIComponent(message)}`));
}

export async function saveNewsletterDiscount(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const parsed = newsletterDiscountPercentSchema.safeParse(formData.get("newsletterDiscountPercent"));
  if (!parsed.success) fail(firstZodMessage(parsed.error));

  updateRuntimeSettings({
    newsletterDiscountPercent: parsed.data,
    settingsUpdatedAt: new Date().toISOString(),
  });
  await flushAtelierSave();
  revalidatePath("/", "layout");
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/ustawienia-sklepu");
  revalidatePath("/zamowienie");
  redirect(withCmsTick("/admin/newsletter?rabat=1"));
}

export async function deleteNewsletterSubscriber(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) fail("Nie znaleziono tego adresu.");

  markNewsletterListAuthoritative();
  if (!removeNewsletterEmail(email)) fail("Ten adres nie jest już na liście.");
  await flushAtelierSave();
  revalidatePath("/admin/newsletter");
  redirect(withCmsTick("/admin/newsletter?usunieto=1"));
}

export async function saveNewsletterSubscriber(
  _prev: SubscriberSaveState,
  formData: FormData,
): Promise<SubscriberSaveState> {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const current = emailSchema.safeParse(formData.get("currentEmail"));
  const next = emailSchema.safeParse(formData.get("email"));
  if (!current.success || !next.success) {
    return { ok: false, message: "Podaj prawidłowy e-mail." };
  }

  markNewsletterListAuthoritative();
  const result = updateNewsletterSubscriber(
    current.data,
    next.data,
    formData.getAll("consentMarketing").includes("true"),
  );
  if (!result.ok && result.error === "taken") {
    return { ok: false, message: "Ten adres jest już na liście." };
  }
  if (!result.ok) return { ok: false, message: "Nie znaleziono tego adresu." };

  if (result.from !== result.to) rebindNewsletterCouponEmail(result.from, result.to);
  await flushAtelierSave();
  revalidatePath("/admin/newsletter");
  return { ok: true, message: "Zapisano adres i zgodę." };
}

async function deliverBroadcast(subject: string, html: string, recipients: string[]) {
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipients.length; i += SEND_CHUNK) {
    const slice = recipients.slice(i, i + SEND_CHUNK);
    const results = await Promise.all(slice.map((to) => sendEmail({ to, subject, html })));
    for (const result of results) {
      if (result.ok) sent += 1;
      else failed += 1;
    }
  }
  return { sent, failed };
}

export async function sendNewsletterBroadcast(
  _prev: BroadcastState,
  formData: FormData,
): Promise<BroadcastState> {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const subjectRaw = String(formData.get("subject") ?? "");
  const bodyRaw = String(formData.get("body") ?? "");
  const parsed = newsletterBroadcastSchema.safeParse({ subject: subjectRaw, body: bodyRaw });
  const keep = { subject: subjectRaw, body: bodyRaw };
  if (!parsed.success) {
    return { ok: false, message: firstZodMessage(parsed.error), ...keep };
  }

  const who = studioIdentity(getRuntimeSettings());
  const html = newsletterBroadcastHtml(parsed.data.body, who.email);
  const preview = formData.get("intent") === "preview";

  if (preview) {
    const to = getAdminEmail();
    const mailed = await sendEmail({ to, subject: `[Próbka] ${parsed.data.subject}`, html });
    if (!mailed.ok) {
      return { ok: false, message: "Próbka nie wyszła. Sprawdź SMTP / Resend.", ...keep };
    }
    return { ok: true, message: `Próbka poszła na ${to}.`, ...keep };
  }

  const recipients = listConsentingNewsletterSubscribers().map((row) => row.email);
  if (recipients.length === 0) {
    return { ok: false, message: "Nikt na liście nie ma zgody marketingowej.", ...keep };
  }

  const { sent, failed } = await deliverBroadcast(parsed.data.subject, html, recipients);
  if (sent === 0) {
    return { ok: false, message: "Żaden mail nie wyszedł. Sprawdź SMTP / Resend.", ...keep };
  }
  const extra = failed > 0 ? ` ${failed} adresów nie przyjęło wysyłki.` : "";
  return { ok: true, sent, message: `Wysłano ${sent} ${sent === 1 ? "wiadomość" : "wiadomości"}.${extra}` };
}
