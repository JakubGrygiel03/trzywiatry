import { ORDER_STATUS_LABELS, SITE } from "@/lib/constants";
import { renderEmailTemplate, resetButtonHtml, wrapEmail, emailButtonHtml } from "@/lib/email/render";
import { formatPLN } from "@/lib/format";
import type { OrderStatus, StoredOrder } from "@/lib/types";
import type { EmailTemplateKey } from "@/lib/email/catalog";

type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = {
  ok: boolean;
  demo: boolean;
  error?: string;
};

/** Shared Resend sender while trzywiatry.pl DNS is still unverified. */
const ONBOARDING_FROM = `Trzy Wiatry <onboarding@${["resend", "dev"].join(".")}>`;

function productionFrom() {
  return process.env.NEWSLETTER_FROM_EMAIL?.trim() || `Trzy Wiatry <${SITE.email}>`;
}

function domainLooksVerified() {
  return process.env.RESEND_DOMAIN_VERIFIED === "true";
}

function fromCandidates() {
  const shop = productionFrom();
  if (domainLooksVerified()) return [shop];
  return shop.toLowerCase().includes("resend.dev") ? [shop] : [shop, ONBOARDING_FROM];
}

function isUnverifiedFromError(status: number, error: string) {
  if (status !== 403 && status !== 422) return false;
  const text = error.toLowerCase();
  return text.includes("not verified") || text.includes("invalid `from`") || text.includes("invalid from");
}

async function postResend(
  key: string,
  from: string,
  message: TransactionalEmail,
): Promise<SendEmailResult & { status?: number }> {
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        reply_to: SITE.email,
        subject: message.subject,
        html: message.html,
      }),
    });
  } catch (error) {
    console.error("[resend] network", error);
    return { ok: false, demo: false, error: "network" };
  }

  const payload = (await response.json().catch(() => null)) as { message?: string; name?: string } | null;
  if (!response.ok) {
    const error = payload?.message ?? payload?.name ?? `HTTP ${response.status}`;
    console.error("[resend]", response.status, error, "→", message.to);
    return { ok: false, demo: false, error, status: response.status };
  }

  return { ok: true, demo: false };
}

/** Always delivers to the address from the form — same path as a live domain. */
export async function sendEmail(message: TransactionalEmail): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn("[resend] brak RESEND_API_KEY — mail nie wyszedł:", message.subject, "→", message.to);
    return { ok: false, demo: true, error: "missing-key" };
  }

  const candidates = fromCandidates();
  let last: SendEmailResult & { status?: number } = { ok: false, demo: false, error: "no-from" };

  for (let i = 0; i < candidates.length; i += 1) {
    const from = candidates[i]!;
    last = await postResend(key, from, message);
    if (last.ok) return last;
    const canRetry = i < candidates.length - 1 && isUnverifiedFromError(last.status ?? 0, last.error ?? "");
    if (!canRetry) return last;
  }

  return last;
}

function itemsList(order: StoredOrder) {
  return order.items
    .map(
      (item) =>
        `<li>${item.productName} (${item.variantTitle}) × ${item.quantity} — ${formatPLN(item.unitPriceInCents * item.quantity)}</li>`,
    )
    .join("");
}

function orderVars(order: StoredOrder, extra: Record<string, string> = {}) {
  return {
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    total: formatPLN(order.totalAmountInCents),
    items: itemsList(order),
    statusLabel: ORDER_STATUS_LABELS[order.status],
    studioEmail: SITE.email,
    vacationBlock: "",
    trackingBlock: order.trackingNumber
      ? `<p><strong>Numer śledzenia:</strong> ${order.trackingNumber}</p>`
      : "<p>Numer śledzenia dopiszemy, gdy kurier / InPost go nada.</p>",
    ...extra,
  };
}

export function orderPlacedEmail(order: StoredOrder, vacationNote?: string) {
  return renderEmailTemplate("order_placed", {
    ...orderVars(order, {
      vacationBlock: vacationNote ? `<p><strong>Przerwa twórcza:</strong> ${vacationNote}</p>` : "",
    }),
  });
}

export function orderPlacedAndStartedHtml(order: StoredOrder, vacationNote?: string) {
  return orderPlacedEmail(order, vacationNote).html;
}

const STATUS_TEMPLATE: Record<OrderStatus, EmailTemplateKey | null> = {
  pending: "order_pending",
  paid: "order_paid",
  processing: "order_processing",
  shipped: "order_shipped",
  completed: "order_completed",
  cancelled: "order_cancelled",
};

export function orderStatusEmail(order: StoredOrder): { subject: string; html: string } | null {
  const key = STATUS_TEMPLATE[order.status];
  if (!key) return null;
  return renderEmailTemplate(key, orderVars(order));
}

/** @deprecated use orderPlacedAndStartedHtml */
export function orderConfirmationHtml(orderNumber: string, vacationNote?: string) {
  return wrapEmail(`
    <p>Dziękujemy za zamówienie <strong>${orderNumber}</strong> w pracowni Trzy Wiatry.</p>
    ${vacationNote ? `<p><strong>Przerwa twórcza:</strong> ${vacationNote}</p>` : ""}
    <p>Pakujemy ręcznie, ze wkładkami — zero stłuczek.</p>
  `);
}

export async function notifyCustomerOrderStatus(order: StoredOrder) {
  const mail = orderStatusEmail(order);
  if (!mail) return { ok: false as const, demo: true as const };
  return sendEmail({
    to: order.customerEmail,
    subject: mail.subject,
    html: mail.html,
  });
}

export async function sendAdminPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Reset hasła do panelu CMS · Trzy Wiatry",
    html: wrapEmail(`
      <h1 style="font-size:22px">Reset hasła do panelu</h1>
      <p>Dostaliśmy prośbę o ustawienie nowego hasła do CMS Trzy Wiatry.</p>
      <p style="margin:24px 0">${resetButtonHtml(resetUrl)}</p>
      <p style="font-size:13px;color:#666">Link ważny 1 godzinę. Jeśli to nie Ty — zignoruj tę wiadomość.</p>
      <p style="font-size:12px;color:#999;word-break:break-all">${resetUrl}</p>
    `),
  });
}

export async function sendCustomerConfirmEmail(to: string, name: string, confirmUrl: string) {
  const mail = renderEmailTemplate("customer_welcome", {
    customerName: name,
    confirmUrl,
    confirmButton: emailButtonHtml(confirmUrl, "Potwierdź konto"),
  });
  return sendEmail({ to, subject: mail.subject, html: mail.html });
}

export async function sendCustomerPasswordResetEmail(to: string, resetUrl: string) {
  const mail = renderEmailTemplate("customer_password_reset", {
    resetUrl,
    resetButton: resetButtonHtml(resetUrl),
  });
  return sendEmail({ to, subject: mail.subject, html: mail.html });
}

export type { OrderStatus };
