import { ORDER_STATUS_LABELS, SITE } from "@/lib/constants";
import { renderEmailTemplate, resetButtonHtml, wrapEmail, emailButtonHtml } from "@/lib/email/render";
import { formatPLN } from "@/lib/format";
import { escapeHtml } from "@/lib/validations/safe-input";
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

/** Resend sandbox sender (resend.dev) until trzywiatry.pl is verified in DNS. */
const ONBOARDING_FROM = `Trzy Wiatry <onboarding@${["resend", "dev"].join(".")}>`;

function resendDomainVerified() {
  return process.env.RESEND_DOMAIN_VERIFIED === "true";
}

function resendFrom() {
  if (!resendDomainVerified()) return ONBOARDING_FROM;
  return process.env.NEWSLETTER_FROM_EMAIL?.trim() || `Trzy Wiatry <${SITE.email}>`;
}

function resendTestInbox() {
  // Resend sandbox only delivers to the email on the Resend account — not the shop inbox.
  return process.env.RESEND_TEST_TO?.trim() || "";
}

function resolveRecipient(intended: string): { to: string; intended: string; rerouted: boolean; blocked?: boolean } {
  if (resendDomainVerified()) return { to: intended, intended, rerouted: false };
  const inbox = resendTestInbox();
  if (!inbox) {
    return { to: "", intended, rerouted: true, blocked: true };
  }
  return { to: inbox, intended, rerouted: inbox.toLowerCase() !== intended.toLowerCase() };
}

function withTestBanner(html: string, intended: string) {
  return `<p style="font-size:12px;color:#9C644E;margin:0 0 16px">Tryb testowy Resend (domena jeszcze niepotwierdzona). Docelowy adres: <strong>${escapeHtml(intended)}</strong></p>${html}`;
}

/** Live Resend send. Missing key or API error never look like success. */
export async function sendEmail(message: TransactionalEmail): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn("[resend] brak RESEND_API_KEY — mail nie wyszedł:", message.subject, "→", message.to);
    return { ok: false, demo: true, error: "missing-key" };
  }

  const recipient = resolveRecipient(message.to);
  if (recipient.blocked) {
    console.error("[resend] sandbox: brak RESEND_TEST_TO — nie piszę na adres klienta:", recipient.intended);
    return { ok: false, demo: true, error: "sandbox-blocked" };
  }

  const sandbox = !resendDomainVerified();
  const subject = sandbox ? `[test → ${recipient.intended}] ${message.subject}` : message.subject;
  const html = sandbox ? withTestBanner(message.html, recipient.intended) : message.html;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom(),
        to: [recipient.to],
        reply_to: SITE.email,
        subject,
        html,
      }),
    });
  } catch (error) {
    console.error("[resend] network", error);
    return { ok: false, demo: false, error: "network" };
  }

  const payload = (await response.json().catch(() => null)) as { message?: string; name?: string } | null;
  if (!response.ok) {
    const error = payload?.message ?? payload?.name ?? `HTTP ${response.status}`;
    console.error("[resend]", response.status, error, "→", recipient.to, recipient.rerouted ? `(dla ${recipient.intended})` : "");
    if (response.status === 403 && !resendDomainVerified()) {
      console.error("[resend] sandbox: ustaw RESEND_TEST_TO na e-mail logowania do Resend (nie na skrzynkę sklepu).");
    }
    return { ok: false, demo: false, error };
  }

  if (recipient.rerouted) {
    console.info("[resend] sandbox: wysłano na", recipient.to, "zamiast", recipient.intended);
  }

  return { ok: true, demo: false };
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
