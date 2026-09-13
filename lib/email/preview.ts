import { SITE } from "@/lib/constants";
import { resetButtonHtml } from "@/lib/email/render";

const SAMPLE_RESET = "https://trzywiatry.pl/konto/nowe-haslo?token=przyklad";

/** Dummy values so admin preview never depends on a live order. */
export const EMAIL_PREVIEW_VARS = {
  customerName: "Anna Nowak",
  orderNumber: "TW-0042",
  total: "185 zł",
  items: "<li>Wygodny kubas (Granatowy) × 1 — 85 zł</li><li>Czarki kremowe × 1 — 70 zł</li>",
  statusLabel: "W realizacji",
  studioEmail: SITE.email,
  vacationBlock: "<p><strong>Przerwa twórcza:</strong> zamówienia złożone do 15.09 wyślemy 16.09.</p>",
  trackingBlock: "<p><strong>Numer śledzenia:</strong> 1234567890</p>",
  code: "WIOSNA",
  workshopTitle: "Toczenie przy kole — sobota",
  seatsCount: "2",
  resetUrl: SAMPLE_RESET,
  resetButton: resetButtonHtml(SAMPLE_RESET),
};
