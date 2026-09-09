import { ORDER_STATUS_LABELS, SITE } from "@/lib/constants";
import { formatPLN } from "@/lib/format";
import type { OrderStatus, StoredOrder } from "@/lib/types";

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

function wrapEmail(body: string) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#010101;line-height:1.55">
    <p style="letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#9C644E">Trzy Wiatry</p>
    ${body}
    <p style="margin-top:28px;font-size:13px;color:#666">Pracownia · ${SITE.address}<br/>${SITE.email}</p>
  </div>`;
}

function itemsList(order: StoredOrder) {
  return order.items
    .map(
      (item) =>
        `<li>${item.productName} (${item.variantTitle}) × ${item.quantity} — ${formatPLN(item.unitPriceInCents * item.quantity)}</li>`,
    )
    .join("");
}

/** Checkout: order placed + fulfillment started (demo auto-paid → processing). */
export function orderPlacedAndStartedHtml(order: StoredOrder, vacationNote?: string) {
  return wrapEmail(`
    <h1 style="font-size:22px">Zamówienie ${order.orderNumber} przyjęte</h1>
    <p>Cześć ${order.customerName}, dziękujemy. Płatność przyjęliśmy i <strong>rozpoczęliśmy realizację</strong> Twojego zamówienia.</p>
    ${vacationNote ? `<p><strong>Przerwa twórcza:</strong> ${vacationNote}</p>` : ""}
    <ul>${itemsList(order)}</ul>
    <p><strong>Razem:</strong> ${formatPLN(order.totalAmountInCents)}</p>
    <p>Pakujemy ręcznie, ze wkładkami — zero stłuczek. Dam znać mailem, gdy paczka wyjdzie z pracowni.</p>
    <p>Status zamówienia śledzisz też po zalogowaniu na konto w sklepie.</p>
  `);
}

export function orderStatusEmail(order: StoredOrder): { subject: string; html: string } | null {
  const label = ORDER_STATUS_LABELS[order.status];
  const base = `Zamówienie ${order.orderNumber}`;

  switch (order.status) {
    case "pending":
      return {
        subject: `${base} · oczekuje na płatność`,
        html: wrapEmail(`
          <h1 style="font-size:22px">Czekamy na płatność</h1>
          <p>Cześć ${order.customerName}, zamówienie <strong>${order.orderNumber}</strong> jest u nas, ale jeszcze nie widzimy płatności.</p>
          <p>Jak tylko przelew / BLIK przejdzie, od razu ruszamy z pakowaniem.</p>
        `),
      };
    case "paid":
      return {
        subject: `${base} · płatność potwierdzona`,
        html: wrapEmail(`
          <h1 style="font-size:22px">Płatność potwierdzona</h1>
          <p>Cześć ${order.customerName}, zamówienie <strong>${order.orderNumber}</strong> jest opłacone (${formatPLN(order.totalAmountInCents)}).</p>
          <p>Zaraz zaczynamy przygotowanie paczki.</p>
        `),
      };
    case "processing":
      return {
        subject: `${base} · rozpoczęliśmy realizację`,
        html: wrapEmail(`
          <h1 style="font-size:22px">Zaczynamy pakować</h1>
          <p>Cześć ${order.customerName}, status zamówienia <strong>${order.orderNumber}</strong>: <em>${label}</em>.</p>
          <p>Piec, wióry i karton — Twoja paczka jest w toku. Dam znać, gdy wyjdzie z pracowni.</p>
          <ul>${itemsList(order)}</ul>
        `),
      };
    case "shipped":
      return {
        subject: `${base} · paczka w drodze`,
        html: wrapEmail(`
          <h1 style="font-size:22px">Paczka wyszła z pracowni</h1>
          <p>Cześć ${order.customerName}, zamówienie <strong>${order.orderNumber}</strong> jest już w drodze.</p>
          ${
            order.trackingNumber
              ? `<p><strong>Numer śledzenia:</strong> ${order.trackingNumber}</p>`
              : "<p>Numer śledzenia dopiszemy, gdy kurier / InPost go nada.</p>"
          }
          <p>Trzymaj kciuki za zero stłuczek — pakujemy podwójnie.</p>
        `),
      };
    case "completed":
      return {
        subject: `${base} · dostarczone`,
        html: wrapEmail(`
          <h1 style="font-size:22px">Zamówienie zakończone</h1>
          <p>Cześć ${order.customerName}, zamówienie <strong>${order.orderNumber}</strong> oznaczyliśmy jako zakończone.</p>
          <p>Dziękujemy za wsparcie lokalnego rzemiosła. Do zobaczenia przy kolejnej czarce.</p>
        `),
      };
    case "cancelled":
      return {
        subject: `${base} · anulowane`,
        html: wrapEmail(`
          <h1 style="font-size:22px">Zamówienie anulowane</h1>
          <p>Cześć ${order.customerName}, zamówienie <strong>${order.orderNumber}</strong> zostało anulowane.</p>
          <p>Jeśli to pomyłka — napisz na ${SITE.email}, ogarniemy.</p>
        `),
      };
    default:
      return null;
  }
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

/** One-time link to set a new CMS password (WordPress-style lost password). */
export async function sendAdminPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Reset hasła do panelu CMS · Trzy Wiatry",
    html: wrapEmail(`
      <h1 style="font-size:22px">Reset hasła do panelu</h1>
      <p>Dostaliśmy prośbę o ustawienie nowego hasła do CMS Trzy Wiatry.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#9C644E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;letter-spacing:0.06em;text-transform:uppercase">
          Ustaw nowe hasło
        </a>
      </p>
      <p style="font-size:13px;color:#666">Link ważny 1 godzinę. Jeśli to nie Ty — zignoruj tę wiadomość.</p>
      <p style="font-size:12px;color:#999;word-break:break-all">${resetUrl}</p>
    `),
  });
}

export async function sendCustomerPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Reset hasła do konta · Trzy Wiatry",
    html: wrapEmail(`
      <h1 style="font-size:22px">Reset hasła</h1>
      <p>Dostaliśmy prośbę o zmianę hasła do konta w sklepie Trzy Wiatry.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#9C644E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;letter-spacing:0.06em;text-transform:uppercase">
          Ustaw nowe hasło
        </a>
      </p>
      <p style="font-size:13px;color:#666">Link ważny 1 godzinę. Jeśli to nie Ty — zignoruj tę wiadomość.</p>
      <p style="font-size:12px;color:#999;word-break:break-all">${resetUrl}</p>
    `),
  });
}

export type { OrderStatus };
