import { ORDER_STATUS_LABELS, SITE, shippingMethodLabel } from "@/lib/constants";
import {
  renderEmailTemplate,
  resetButtonHtml,
  wrapEmail,
  emailButtonHtml,
  emailDetailRows,
  emailDetailTile,
  emailHighlightTile,
  emailItemsTile,
} from "@/lib/email/render";
import { formatPLN } from "@/lib/format";
import { sendViaSmtp, type EmailAttachment } from "@/lib/smtp-mailer";
import type { OrderStatus, StoredOrder } from "@/lib/types";
import type { EmailTemplateKey } from "@/lib/email/catalog";
import { escapeHtml } from "@/lib/validations/safe-input";
import { orderPaymentDisplay } from "@/lib/p24-methods";

type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  /** Ops copies use the customer address so Reply opens a thread with them. */
  replyTo?: string;
  attachments?: EmailAttachment[];
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
  return process.env.RESEND_DOMAIN_VERIFIED?.trim() === "true";
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
        reply_to: message.replyTo?.trim() || SITE.email,
        subject: message.subject,
        html: message.html,
        ...(message.attachments?.length
          ? {
              attachments: message.attachments.map((file) => ({
                filename: file.filename,
                content: Buffer.from(file.content, "utf8").toString("base64"),
              })),
            }
          : {}),
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

export function customerMailFailureMessage(error?: string) {
  const text = (error ?? "").toLowerCase();
  if (
    text.includes("only send testing") ||
    text.includes("your own email") ||
    text.includes("missing-smtp") ||
    text.includes("testing emails")
  ) {
    return "Mail nie wyszedł: Resend wysyła tylko na skrzynkę pracowni. W .env.local ustaw SMTP_PASS (hasło aplikacji Gmail) i zrestartuj next dev — albo zweryfikuj send.trzywiatry.pl w Resend.";
  }
  if (text.includes("smtp-failed") || text.includes("invalid login") || text.includes("username and password")) {
    return "SMTP odrzucił wysyłkę. Sprawdź hasło aplikacji Gmail w SMTP_PASS (nie zwykłe hasło do konta).";
  }
  if (text.includes("missing-key") || text.includes("no-from")) {
    return "Brak konfiguracji maila (RESEND_API_KEY / SMTP). Uzupełnij .env.local i zrestartuj serwer.";
  }
  return "Nie udało się wysłać maila. Sprawdź SMTP_PASS albo napisz do pracowni.";
}

/** Always delivers to the address from the form — same path as a live domain. */
export async function sendEmail(message: TransactionalEmail): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  let last: SendEmailResult & { status?: number } = { ok: false, demo: false, error: "no-from" };

  if (key) {
    const candidates = fromCandidates();
    for (let i = 0; i < candidates.length; i += 1) {
      const from = candidates[i]!;
      last = await postResend(key, from, message);
      if (last.ok) return last;
      const canRetry = i < candidates.length - 1 && isUnverifiedFromError(last.status ?? 0, last.error ?? "");
      if (!canRetry) break;
    }
  } else {
    console.warn("[resend] brak RESEND_API_KEY — próbuję SMTP:", message.subject, "→", message.to);
    last = { ok: false, demo: true, error: "missing-key" };
  }

  const smtp = await sendViaSmtp(message);
  if (smtp.ok) {
    console.info("[mail] sent via SMTP →", message.to);
    return smtp;
  }

  const resendText = (last.error ?? "").toLowerCase();
  const testingBlocked =
    resendText.includes("only send testing") ||
    resendText.includes("your own email") ||
    resendText.includes("testing emails");

  // Prefer the actionable cause when Resend is locked to the account inbox.
  if (testingBlocked && smtp.error === "missing-smtp") {
    return { ok: false, demo: false, error: "missing-smtp" };
  }

  return {
    ok: false,
    demo: last.demo && smtp.error === "missing-smtp",
    error: last.error ?? smtp.error ?? "send-failed",
  };
}

function itemsList(order: StoredOrder) {
  return order.items
    .map(
      (item) =>
        `<li style="margin:0 0 8px;">${escapeHtml(item.productName)} (${escapeHtml(item.variantTitle)}) × ${item.quantity} — ${formatPLN(item.unitPriceInCents * item.quantity)}</li>`,
    )
    .join("");
}

function orderVars(order: StoredOrder, extra: Record<string, string> = {}) {
  const details = emailDetailTile(
    "Szczegóły zamówienia",
    emailDetailRows([
      { label: "Numer", value: escapeHtml(order.orderNumber) },
      { label: "Kwota", value: formatPLN(order.totalAmountInCents) },
      { label: "Status", value: ORDER_STATUS_LABELS[order.status] },
      { label: "Dostawa", value: shippingMethodLabel(order.shippingMethod) },
      { label: "Płatność", value: orderPaymentDisplay(order) },
    ]),
  );

  return {
    customerName: escapeHtml(order.customerName),
    orderNumber: escapeHtml(order.orderNumber),
    total: formatPLN(order.totalAmountInCents),
    items: itemsList(order),
    itemsBlock: emailItemsTile(itemsList(order)),
    highlightBlock: emailHighlightTile("Numer zamówienia", escapeHtml(order.orderNumber)),
    detailsBlock: details,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    studioEmail: SITE.email,
    vacationBlock: "",
    trackingBlock: order.trackingNumber
      ? emailDetailTile(
          "Śledzenie przesyłki",
          emailDetailRows([{ label: "Numer", value: escapeHtml(order.trackingNumber) }]),
        )
      : emailDetailTile(
          "Śledzenie przesyłki",
          `<p style="margin:0;font-size:14px;line-height:1.5;color:#010101;">Numer śledzenia dopiszemy, gdy kurier / InPost go nada.</p>`,
        ),
    ...extra,
  };
}

export function orderPlacedEmail(order: StoredOrder, vacationNote?: string) {
  return renderEmailTemplate("order_placed", {
    ...orderVars(order, {
      vacationBlock: vacationNote
        ? emailDetailTile(
            "Przerwa twórcza",
            `<p style="margin:0;font-size:14px;line-height:1.5;color:#010101;">${escapeHtml(vacationNote)}</p>`,
          )
        : "",
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
      <h1>Reset hasła do panelu</h1>
      <p>Dostaliśmy prośbę o ustawienie nowego hasła do CMS Trzy Wiatry.</p>
      ${resetButtonHtml(resetUrl)}
      <p><strong>Uwaga!</strong> Link wygaśnie za 1 godzinę. Jeśli to nie Ty — zignoruj tę wiadomość.</p>
      <p style="font-size:12px;color:#9A9A9A;word-break:break-all;">${resetUrl}</p>
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
