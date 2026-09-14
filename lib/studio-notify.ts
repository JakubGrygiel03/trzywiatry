import { ORDER_STATUS_LABELS, SHIPPING_METHODS } from "@/lib/constants";
import { wrapEmail } from "@/lib/email/render";
import { formatPLN } from "@/lib/format";
import { sendEmail } from "@/lib/resend";
import { absoluteUrl } from "@/lib/site-url";
import type { StoredOrder } from "@/lib/types";
import { escapeHtml } from "@/lib/validations/safe-input";
import type { B2BInput } from "@/lib/validations/b2b";

/** Company Gmail until trzywiatry.pl inboxes are live; override with STUDIO_NOTIFY_EMAIL. */
const DEFAULT_STUDIO_INBOX = "trzywiatrystudio@gmail.com";

export function studioNotifyInboxes() {
  const raw = process.env.STUDIO_NOTIFY_EMAIL?.trim() || DEFAULT_STUDIO_INBOX;
  return [...new Set(raw.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

export async function notifyStudio(input: { subject: string; html: string; replyTo?: string }) {
  const inboxes = studioNotifyInboxes();
  if (inboxes.length === 0) {
    return { ok: false as const, demo: true as const, error: "missing-studio-inbox" };
  }

  const results = await Promise.all(
    inboxes.map((to) =>
      sendEmail({
        to,
        subject: `Pracownia · ${input.subject}`,
        html: input.html,
        replyTo: input.replyTo,
      }),
    ),
  );
  return results.find((item) => item.ok) ?? results[0]!;
}

function shippingLabel(order: StoredOrder) {
  return SHIPPING_METHODS.find((method) => method.id === order.shippingMethod)?.label ?? order.shippingMethod;
}

export async function notifyStudioNewOrder(order: StoredOrder) {
  const items = order.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.productName)} (${escapeHtml(item.variantTitle)}) × ${item.quantity} — ${formatPLN(item.unitPriceInCents * item.quantity)}</li>`,
    )
    .join("");
  const locker = order.inpostLocker
    ? `<p><strong>Paczkomat:</strong> ${escapeHtml(order.inpostLocker)}</p>`
    : "";
  const notes = order.notes ? `<p><strong>Uwagi:</strong> ${escapeHtml(order.notes)}</p>` : "";
  const gift = order.hasGiftWrapping
    ? `<p><strong>Pakowanie na prezent</strong>${order.giftMessage ? `: ${escapeHtml(order.giftMessage)}` : ""}</p>`
    : "";
  const discount = order.discountAmountCents
    ? ` · Rabat ${formatPLN(order.discountAmountCents)}${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ""}`
    : "";
  const giftCost = order.giftWrappingCostCents ? ` · Prezent ${formatPLN(order.giftWrappingCostCents)}` : "";

  return notifyStudio({
    subject: `Nowe zamówienie ${order.orderNumber} · ${formatPLN(order.totalAmountInCents)}`,
    replyTo: order.customerEmail,
    html: wrapEmail(`
      <h1 style="font-size:22px">Nowe zamówienie ${escapeHtml(order.orderNumber)}</h1>
      <p>Status: ${ORDER_STATUS_LABELS[order.status]}</p>
      <p><strong>${escapeHtml(order.customerName)}</strong><br/>
      ${escapeHtml(order.customerEmail)} · ${escapeHtml(order.customerPhone)}</p>
      <p>${escapeHtml(order.street)}<br/>${escapeHtml(order.postalCode)} ${escapeHtml(order.city)}</p>
      <p><strong>Wysyłka:</strong> ${escapeHtml(shippingLabel(order))}</p>
      ${locker}
      <ul>${items}</ul>
      <p>Towar ${formatPLN(order.goodsInCents)} · Wysyłka ${formatPLN(order.shippingCostInCents)}${giftCost}${discount}
      <br/><strong>Razem ${formatPLN(order.totalAmountInCents)}</strong></p>
      ${gift}
      ${notes}
      <p style="font-size:13px;color:#666">Panel: ${absoluteUrl(`/admin/zamowienia/${order.id}`)}</p>
    `),
  });
}

export async function notifyStudioOrderPaid(order: StoredOrder) {
  return notifyStudio({
    subject: `Opłacone ${order.orderNumber} · ${formatPLN(order.totalAmountInCents)}`,
    replyTo: order.customerEmail,
    html: wrapEmail(`
      <h1 style="font-size:22px">Płatność weszła · ${escapeHtml(order.orderNumber)}</h1>
      <p><strong>${escapeHtml(order.customerName)}</strong> · ${escapeHtml(order.customerEmail)}</p>
      <p>Razem ${formatPLN(order.totalAmountInCents)}. Można pakować.</p>
      <p style="font-size:13px;color:#666">Panel: ${absoluteUrl(`/admin/zamowienia/${order.id}`)}</p>
    `),
  });
}

export async function notifyStudioContact(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  return notifyStudio({
    subject: `Kontakt · ${input.name}`,
    replyTo: input.email,
    html: wrapEmail(`
      <h1 style="font-size:22px">Wiadomość z formularza</h1>
      <p><strong>${escapeHtml(input.name)}</strong><br/>
      ${escapeHtml(input.email)}${input.phone ? ` · ${escapeHtml(input.phone)}` : ""}</p>
      <p>${escapeHtml(input.message)}</p>
    `),
  });
}

export async function notifyStudioB2B(input: B2BInput) {
  return notifyStudio({
    subject: `Zapytanie B2B · ${input.companyName}`,
    replyTo: input.email,
    html: wrapEmail(`
      <h1 style="font-size:22px">Zapytanie HoReCa / B2B</h1>
      <p><strong>${escapeHtml(input.companyName)}</strong> · NIP ${escapeHtml(input.nip || "—")}</p>
      <p>${escapeHtml(input.contactPerson)} · ${escapeHtml(input.email)} · ${escapeHtml(input.phone)}</p>
      <p>Wolumen: ${escapeHtml(input.estimatedQuantity)}</p>
      <p>${escapeHtml(input.message)}</p>
    `),
  });
}

export async function notifyStudioWorkshop(input: {
  workshopTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  seatsCount: number;
}) {
  return notifyStudio({
    subject: `Warsztat · ${input.workshopTitle} · ${input.seatsCount} os.`,
    replyTo: input.attendeeEmail,
    html: wrapEmail(`
      <h1 style="font-size:22px">Rezerwacja warsztatu</h1>
      <p><strong>${escapeHtml(input.workshopTitle)}</strong> · ${input.seatsCount} ${input.seatsCount === 1 ? "osoba" : "osób"}</p>
      <p>${escapeHtml(input.attendeeName)}<br/>
      ${escapeHtml(input.attendeeEmail)} · ${escapeHtml(input.attendeePhone)}</p>
      <p style="font-size:13px;color:#666">To jeszcze nie jest opłacony bilet — potwierdźcie płatność z klientem.</p>
    `),
  });
}
