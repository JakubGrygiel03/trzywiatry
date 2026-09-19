import { ORDER_STATUS_LABELS, SITE, shippingMethodLabel } from "@/lib/constants";
import { wrapEmail } from "@/lib/email/render";
import { formatPLN } from "@/lib/format";
import { formatPhoneDisplay } from "@/lib/phone";
import { sendEmail } from "@/lib/resend";
import { absoluteUrl } from "@/lib/site-url";
import type { StoredOrder } from "@/lib/types";
import { escapeHtml } from "@/lib/validations/safe-input";
import type { B2BInput } from "@/lib/validations/b2b";

/** Company Gmail until trzywiatry.pl inboxes are live; override with STUDIO_NOTIFY_EMAIL. */
const DEFAULT_STUDIO_INBOX = "trzywiatrystudio@gmail.com";

export function studioNotifyInboxes() {
  const raw =
    process.env.STUDIO_NOTIFY_EMAIL?.trim() || `${DEFAULT_STUDIO_INBOX},${SITE.email}`;
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
  return shippingMethodLabel(order.shippingMethod);
}

/** Labeled rows — easier to skim in Gmail than a wall of text. */
function emailRow(label: string, value: string) {
  if (!value.trim()) return "";
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top;width:34%;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#9C644E">${escapeHtml(label)}</td>
    <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eee;vertical-align:top;font-size:15px;color:#010101;line-height:1.45">${value}</td>
  </tr>`;
}

function emailTable(rows: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 20px">${rows}</table>`;
}

function emailBlock(title: string, bodyHtml: string) {
  return `<div style="margin:0 0 18px;padding:16px 18px;border-radius:14px;background:#F4EFE8;border:1px solid #e6dfd4">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#9C644E">${escapeHtml(title)}</p>
    <div style="font-size:15px;line-height:1.55;color:#010101;white-space:pre-wrap">${bodyHtml}</div>
  </div>`;
}

export async function notifyStudioNewOrder(order: StoredOrder) {
  const items = order.items
    .map(
      (item) =>
        `<li style="margin:0 0 6px">${escapeHtml(item.productName)} (${escapeHtml(item.variantTitle)}) × ${item.quantity} — ${formatPLN(item.unitPriceInCents * item.quantity)}</li>`,
    )
    .join("");
  const gift = order.hasGiftWrapping
    ? `<div style="margin:20px 0;padding:20px 22px;border-radius:16px;background:#9C644E;color:#fff">
        <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.85">Uwaga pracowni</p>
        <p style="margin:8px 0 0;font-size:26px;line-height:1.15;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">
          Pakowanie na prezent
        </p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.45;opacity:0.95">
          Pudełko, wstążka i bilecik${
            order.giftWrappingCostCents ? ` · ${formatPLN(order.giftWrappingCostCents)}` : ""
          }. Nie pakuj jak zwykłej wysyłki.
        </p>
        ${
          order.giftMessage
            ? `<p style="margin:14px 0 0;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.15);font-size:15px;line-height:1.45">
                <strong>Dedykacja:</strong> „${escapeHtml(order.giftMessage)}”
              </p>`
            : `<p style="margin:12px 0 0;font-size:14px;opacity:0.8">Bez dedykacji — tylko ozdobne pakowanie.</p>`
        }
      </div>`
    : "";
  const discount = order.discountAmountCents
    ? ` · Rabat ${formatPLN(order.discountAmountCents)}${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ""}`
    : "";
  const giftCost = order.giftWrappingCostCents ? ` · Prezent ${formatPLN(order.giftWrappingCostCents)}` : "";
  const giftSubject = order.hasGiftWrapping ? " · PREZENT" : "";

  return notifyStudio({
    subject: `Nowe zamówienie ${order.orderNumber}${giftSubject} · ${formatPLN(order.totalAmountInCents)}`,
    replyTo: order.customerEmail,
    html: wrapEmail(`
      <h1 style="margin:0 0 6px;font-size:24px;line-height:1.2">Nowe zamówienie</h1>
      <p style="margin:0 0 18px;font-size:14px;color:#666">${escapeHtml(order.orderNumber)} · ${ORDER_STATUS_LABELS[order.status]}</p>
      ${gift}
      ${emailTable(
        emailRow("Klient", `<strong>${escapeHtml(order.customerName)}</strong>`) +
          emailRow("E-mail", `<a href="mailto:${escapeHtml(order.customerEmail)}" style="color:#9C644E">${escapeHtml(order.customerEmail)}</a>`) +
          emailRow("Telefon", `<a href="tel:${escapeHtml(order.customerPhone.replace(/\s/g, ""))}" style="color:#010101;text-decoration:none">${escapeHtml(formatPhoneDisplay(order.customerPhone))}</a>`) +
          emailRow("Adres", `${escapeHtml(order.street)}<br/>${escapeHtml(order.postalCode)} ${escapeHtml(order.city)}`) +
          emailRow("Wysyłka", escapeHtml(shippingLabel(order))) +
          (order.inpostLocker ? emailRow("Paczkomat", escapeHtml(order.inpostLocker)) : ""),
      )}
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9C644E">Pozycje</p>
      <ul style="margin:0 0 16px;padding-left:18px">${items}</ul>
      <p style="margin:0 0 8px;font-size:15px">Towar ${formatPLN(order.goodsInCents)} · Wysyłka ${formatPLN(order.shippingCostInCents)}${giftCost}${discount}</p>
      <p style="margin:0 0 16px;font-size:18px"><strong>Razem ${formatPLN(order.totalAmountInCents)}</strong></p>
      ${order.notes ? emailBlock("Uwagi klienta", escapeHtml(order.notes)) : ""}
      <p style="font-size:13px;color:#666"><a href="${absoluteUrl(`/admin/zamowienia/${order.id}`)}" style="color:#9C644E">Otwórz w panelu</a></p>
    `),
  });
}

export async function notifyStudioOrderPaid(order: StoredOrder) {
  const gift = order.hasGiftWrapping
    ? `<div style="margin:20px 0;padding:20px 22px;border-radius:16px;background:#9C644E;color:#fff">
        <p style="margin:0;font-size:26px;line-height:1.15;font-weight:700;text-transform:uppercase">
          Pakowanie na prezent
        </p>
        ${
          order.giftMessage
            ? `<p style="margin:12px 0 0;font-size:15px">Dedykacja: „${escapeHtml(order.giftMessage)}”</p>`
            : ""
        }
      </div>`
    : "";
  const giftSubject = order.hasGiftWrapping ? " · PREZENT" : "";

  return notifyStudio({
    subject: `Opłacone ${order.orderNumber}${giftSubject} · ${formatPLN(order.totalAmountInCents)}`,
    replyTo: order.customerEmail,
    html: wrapEmail(`
      <h1 style="margin:0 0 6px;font-size:24px;line-height:1.2">Płatność weszła</h1>
      <p style="margin:0 0 18px;font-size:14px;color:#666">${escapeHtml(order.orderNumber)}</p>
      ${gift}
      ${emailTable(
        emailRow("Klient", `<strong>${escapeHtml(order.customerName)}</strong>`) +
          emailRow("E-mail", `<a href="mailto:${escapeHtml(order.customerEmail)}" style="color:#9C644E">${escapeHtml(order.customerEmail)}</a>`) +
          emailRow("Telefon", escapeHtml(formatPhoneDisplay(order.customerPhone))) +
          emailRow("Do zapłaty", `<strong>${formatPLN(order.totalAmountInCents)}</strong>`),
      )}
      <p style="margin:0 0 16px">${
        order.hasGiftWrapping ? "Pakuj jako prezent — nie jak zwykłą wysyłkę." : "Można pakować."
      }</p>
      <p style="font-size:13px;color:#666"><a href="${absoluteUrl(`/admin/zamowienia/${order.id}`)}" style="color:#9C644E">Otwórz w panelu</a></p>
    `),
  });
}

export async function notifyStudioContact(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const phone = input.phone ? formatPhoneDisplay(input.phone) : "";
  return notifyStudio({
    subject: `Kontakt · ${input.name}`,
    replyTo: input.email,
    html: wrapEmail(`
      <h1 style="margin:0 0 18px;font-size:24px;line-height:1.2">Wiadomość z formularza</h1>
      ${emailTable(
        emailRow("Imię", `<strong>${escapeHtml(input.name)}</strong>`) +
          emailRow("E-mail", `<a href="mailto:${escapeHtml(input.email)}" style="color:#9C644E">${escapeHtml(input.email)}</a>`) +
          (phone
            ? emailRow(
                "Telefon",
                `<a href="tel:${escapeHtml(input.phone!.replace(/\s/g, ""))}" style="color:#010101;text-decoration:none">${escapeHtml(phone)}</a>`,
              )
            : ""),
      )}
      ${emailBlock("Treść wiadomości", escapeHtml(input.message))}
      <p style="font-size:13px;color:#666">Odpowiedz bezpośrednio na tę wiadomość (Reply-To = klient).</p>
    `),
  });
}

export async function notifyStudioB2B(input: B2BInput) {
  const phone = formatPhoneDisplay(input.phone);
  return notifyStudio({
    subject: `Zapytanie B2B · ${input.companyName}`,
    replyTo: input.email,
    html: wrapEmail(`
      <h1 style="margin:0 0 6px;font-size:24px;line-height:1.2">Zapytanie HoReCa / B2B</h1>
      <p style="margin:0 0 18px;font-size:14px;color:#666">Nowe zapytanie ofertowe ze strony sklepu</p>
      ${emailTable(
        emailRow("Firma", `<strong>${escapeHtml(input.companyName)}</strong>`) +
          emailRow("NIP / VAT", escapeHtml(input.nip || "—")) +
          emailRow("Osoba kontaktowa", escapeHtml(input.contactPerson)) +
          emailRow("E-mail", `<a href="mailto:${escapeHtml(input.email)}" style="color:#9C644E">${escapeHtml(input.email)}</a>`) +
          emailRow(
            "Telefon",
            `<a href="tel:${escapeHtml(input.phone.replace(/\s/g, ""))}" style="color:#010101;text-decoration:none">${escapeHtml(phone)}</a>`,
          ) +
          emailRow("Szacowany wolumen", escapeHtml(input.estimatedQuantity)),
      )}
      ${emailBlock("Opis współpracy", escapeHtml(input.message))}
      <p style="font-size:13px;color:#666">Odpowiedz Reply — trafi prosto do klienta. Panel: <a href="${absoluteUrl("/admin/b2b")}" style="color:#9C644E">Zapytania B2B</a></p>
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
  const phone = formatPhoneDisplay(input.attendeePhone);
  return notifyStudio({
    subject: `Warsztat · ${input.workshopTitle} · ${input.seatsCount} os.`,
    replyTo: input.attendeeEmail,
    html: wrapEmail(`
      <h1 style="margin:0 0 6px;font-size:24px;line-height:1.2">Rezerwacja warsztatu</h1>
      <p style="margin:0 0 18px;font-size:14px;color:#666">To jeszcze nie jest opłacony bilet — potwierdźcie płatność z klientem.</p>
      ${emailTable(
        emailRow("Warsztat", `<strong>${escapeHtml(input.workshopTitle)}</strong>`) +
          emailRow("Miejsca", `${input.seatsCount} ${input.seatsCount === 1 ? "osoba" : "osób"}`) +
          emailRow("Uczestnik", escapeHtml(input.attendeeName)) +
          emailRow("E-mail", `<a href="mailto:${escapeHtml(input.attendeeEmail)}" style="color:#9C644E">${escapeHtml(input.attendeeEmail)}</a>`) +
          emailRow(
            "Telefon",
            `<a href="tel:${escapeHtml(input.attendeePhone.replace(/\s/g, ""))}" style="color:#010101;text-decoration:none">${escapeHtml(phone)}</a>`,
          ),
      )}
    `),
  });
}
