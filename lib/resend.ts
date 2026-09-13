import { ORDER_STATUS_LABELS, SITE } from "@/lib/constants";
import { renderEmailTemplate, resetButtonHtml, wrapEmail } from "@/lib/email/render";
import { formatPLN } from "@/lib/format";
import type { OrderStatus, StoredOrder } from "@/lib/types";
import type { EmailTemplateKey } from "@/lib/email/catalog";

type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
};

/** Resend wrapper. Without RESEND_API_KEY we log a demo payload. */
export async function sendEmail(message: TransactionalEmail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL ?? "kontakt@trzywiatry.pl";

  if (!key) {
    console.info("[resend:demo]", message.subject, "→", message.to);
    return { ok: true, demo: true as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...message }),
  });

  return { ok: response.ok, demo: false as const };
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

export async function sendCustomerPasswordResetEmail(to: string, resetUrl: string) {
  const mail = renderEmailTemplate("customer_password_reset", {
    resetUrl,
    resetButton: resetButtonHtml(resetUrl),
  });
  return sendEmail({ to, subject: mail.subject, html: mail.html });
}

export type { OrderStatus };
