import { SITE } from "@/lib/constants";
import {
  emailButtonHtml,
  emailDetailRows,
  emailDetailTile,
  emailHighlightTile,
  emailItemsTile,
  resetButtonHtml,
} from "@/lib/email/render";

const SAMPLE_RESET = "https://trzywiatry.pl/konto/nowe-haslo?token=przyklad";
const SAMPLE_CONFIRM = "https://trzywiatry.pl/konto/potwierdz-email?token=przyklad";

const sampleItems =
  '<li style="margin:0 0 8px;">Wygodny kubas (Granatowy) × 1 — 85 zł</li><li style="margin:0 0 8px;">Czarki kremowe × 1 — 70 zł</li>';

/** Dummy values so admin preview never depends on a live order. */
export const EMAIL_PREVIEW_VARS: Record<string, string> = {
  customerName: "Anna Nowak",
  orderNumber: "TW-0042",
  total: "185 zł",
  items: sampleItems,
  itemsBlock: emailItemsTile(sampleItems),
  highlightBlock: emailHighlightTile("Numer zamówienia", "TW-0042"),
  detailsBlock: emailDetailTile(
    "Szczegóły zamówienia",
    emailDetailRows([
      { label: "Numer", value: "TW-0042" },
      { label: "Kwota", value: "185 zł" },
      { label: "Status", value: "Opłacone" },
      { label: "Dostawa", value: "Paczkomat InPost" },
      { label: "Płatność", value: "BLIK" },
    ]),
  ),
  statusLabel: "W realizacji",
  studioEmail: SITE.email,
  vacationBlock: emailDetailTile(
    "Przerwa twórcza",
    `<p style="margin:0;font-size:14px;line-height:1.5;color:#010101;">Zamówienia złożone do 15.09 wyślemy 16.09.</p>`,
  ),
  trackingBlock: emailDetailTile(
    "Śledzenie przesyłki",
    emailDetailRows([{ label: "Numer", value: "1234567890" }]),
  ),
  code: "WIOSNA",
  workshopTitle: "Toczenie przy kole — sobota",
  seatsCount: "2",
  resetUrl: SAMPLE_RESET,
  resetButton: resetButtonHtml(SAMPLE_RESET),
  confirmUrl: SAMPLE_CONFIRM,
  confirmButton: emailButtonHtml(SAMPLE_CONFIRM, "Potwierdź konto"),
};
