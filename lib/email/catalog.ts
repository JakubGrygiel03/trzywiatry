export const EMAIL_TEMPLATE_KEYS = [
  "order_placed",
  "order_pending",
  "order_paid",
  "order_processing",
  "order_shipped",
  "order_completed",
  "order_cancelled",
  "newsletter_welcome",
  "workshop_ticket",
  "contact_ack",
  "customer_welcome",
  "customer_password_reset",
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export type EmailTemplateMeta = {
  key: EmailTemplateKey;
  label: string;
  trigger: string;
  tokens: string[];
  subject: string;
  body: string;
};

/**
 * Body HTML is wrapped by wrapEmail (Hostinger/P24 card shell).
 * Use {highlightBlock} / {detailsBlock} / {itemsBlock} for nested tiles.
 */
export const EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplateMeta> = {
  order_placed: {
    key: "order_placed",
    label: "Zamówienie przyjęte",
    trigger: "Klient składa zamówienie w kasie.",
    tokens: [
      "customerName",
      "orderNumber",
      "highlightBlock",
      "detailsBlock",
      "itemsBlock",
      "total",
      "vacationBlock",
    ],
    subject: "Zamówienie {orderNumber} · przyjęte",
    body: `<h1>Zamówienie przyjęte</h1>
<p>Dzień dobry {customerName},</p>
<p>dziękujemy — zapisaliśmy Twoje zamówienie w pracowni. Status na start: <strong>oczekuje na płatność</strong>.</p>
{highlightBlock}
{vacationBlock}
{detailsBlock}
{itemsBlock}
<p>Jak tylko płatność wejdzie, ruszamy z pakowaniem (wkładki, karton — zero stłuczek). Dam znać mailem, gdy paczka wyjdzie z pracowni.</p>
<p>Status śledzisz też po zalogowaniu na konto w sklepie.</p>`,
  },
  order_pending: {
    key: "order_pending",
    label: "Oczekuje na płatność",
    trigger: "Admin ustawia status „oczekuje na płatność”.",
    tokens: ["customerName", "orderNumber", "highlightBlock", "detailsBlock"],
    subject: "Zamówienie {orderNumber} · oczekuje na płatność",
    body: `<h1>Czekamy na płatność</h1>
<p>Dzień dobry {customerName},</p>
<p>zamówienie jest u nas, ale jeszcze nie widzimy płatności. Jak tylko przelew / BLIK przejdzie, od razu ruszamy z pakowaniem.</p>
{highlightBlock}
{detailsBlock}`,
  },
  order_paid: {
    key: "order_paid",
    label: "Płatność potwierdzona",
    trigger: "Płatność P24 / zmiana statusu na „opłacone”.",
    tokens: ["customerName", "orderNumber", "highlightBlock", "detailsBlock", "total"],
    subject: "Zamówienie {orderNumber} · płatność potwierdzona",
    body: `<h1>Płatność potwierdzona</h1>
<p>Dzień dobry {customerName},</p>
<p>otrzymaliśmy płatność. Zaraz zaczynamy przygotowanie paczki.</p>
{highlightBlock}
{detailsBlock}`,
  },
  order_processing: {
    key: "order_processing",
    label: "W realizacji",
    trigger: "Admin oznacza zamówienie jako „w realizacji”.",
    tokens: ["customerName", "orderNumber", "highlightBlock", "detailsBlock", "itemsBlock", "statusLabel"],
    subject: "Zamówienie {orderNumber} · rozpoczęliśmy realizację",
    body: `<h1>Zaczynamy pakować</h1>
<p>Dzień dobry {customerName},</p>
<p>status zamówienia: <strong>{statusLabel}</strong>. Piec, wióry i karton — Twoja paczka jest w toku.</p>
{highlightBlock}
{detailsBlock}
{itemsBlock}`,
  },
  order_shipped: {
    key: "order_shipped",
    label: "Paczka wysłana",
    trigger: "Admin ustawia status „wysłane” i numer śledzenia.",
    tokens: ["customerName", "orderNumber", "highlightBlock", "detailsBlock", "trackingBlock"],
    subject: "Zamówienie {orderNumber} · paczka w drodze",
    body: `<h1>Paczka wyszła z pracowni</h1>
<p>Dzień dobry {customerName},</p>
<p>zamówienie jest już w drodze. Trzymaj kciuki za zero stłuczek — pakujemy podwójnie.</p>
{highlightBlock}
{trackingBlock}
{detailsBlock}`,
  },
  order_completed: {
    key: "order_completed",
    label: "Zamówienie zakończone",
    trigger: "Admin oznacza zamówienie jako dostarczone.",
    tokens: ["customerName", "orderNumber", "highlightBlock", "detailsBlock"],
    subject: "Zamówienie {orderNumber} · dostarczone",
    body: `<h1>Zamówienie zakończone</h1>
<p>Dzień dobry {customerName},</p>
<p>oznaczyliśmy zamówienie jako zakończone. Dziękujemy za wsparcie lokalnego rzemiosła — do zobaczenia przy kolejnej czarce.</p>
{highlightBlock}
{detailsBlock}`,
  },
  order_cancelled: {
    key: "order_cancelled",
    label: "Zamówienie anulowane",
    trigger: "Admin anuluje zamówienie.",
    tokens: ["customerName", "orderNumber", "highlightBlock", "detailsBlock", "studioEmail"],
    subject: "Zamówienie {orderNumber} · anulowane",
    body: `<h1>Zamówienie anulowane</h1>
<p>Dzień dobry {customerName},</p>
<p>zamówienie zostało anulowane. Jeśli to pomyłka — napisz na {studioEmail}, ogarniemy.</p>
{highlightBlock}
{detailsBlock}`,
  },
  newsletter_welcome: {
    key: "newsletter_welcome",
    label: "Newsletter — kod rabatowy",
    trigger: "Klient zapisuje się na newsletter.",
    tokens: ["code", "highlightBlock"],
    subject: "Twój kod {code} · Trzy Wiatry",
    body: `<h1>Witaj w pracowni</h1>
<p>Dziękujemy za zapis. Oto Twój kod rabatowy — wpisz go w kasie przy kolejnym zamówieniu.</p>
{highlightBlock}
<p>Zachowaj ostrożność i nie udostępniaj kodu publicznie, jeśli nie chcesz się nim dzielić.</p>`,
  },
  workshop_ticket: {
    key: "workshop_ticket",
    label: "Bilet na warsztat",
    trigger: "Klient rezerwuje miejsce na warsztat.",
    tokens: ["workshopTitle", "seatsCount", "detailsBlock"],
    subject: "Bilet · {workshopTitle}",
    body: `<h1>Rezerwacja potwierdzona</h1>
<p>Do zobaczenia przy kole. Szczegóły Twojego biletu:</p>
{detailsBlock}`,
  },
  contact_ack: {
    key: "contact_ack",
    label: "Potwierdzenie kontaktu",
    trigger: "Klient wysyła formularz na /kontakt.",
    tokens: ["customerName", "studioEmail"],
    subject: "Dostaliśmy Twoją wiadomość · Trzy Wiatry",
    body: `<h1>Wiadomość dotarła do pracowni</h1>
<p>Dzień dobry {customerName},</p>
<p>dziękujemy za kontakt. Odpowiemy jak tylko zejdziemy od koła — zwykle w ciągu 1–2 dni roboczych.</p>
<p>Jeśli coś pilnego: <strong>{studioEmail}</strong></p>`,
  },
  customer_welcome: {
    key: "customer_welcome",
    label: "Potwierdzenie e-mail",
    trigger: "Klient zakłada konto — musi kliknąć link, zanim się zaloguje.",
    tokens: ["customerName", "confirmButton", "confirmUrl"],
    subject: "Potwierdź konto w pracowni",
    body: `<h1>Potwierdź swoje konto</h1>
<p>Dzień dobry {customerName},</p>
<p>ktoś podał ten adres przy rejestracji w sklepie Trzy Wiatry. Kliknij przycisk, żeby potwierdzić skrzynkę i aktywować konto.</p>
{confirmButton}
<p>Link ważny 24 godziny. Jeśli to nie Ty — zignoruj tę wiadomość.</p>
<p style="font-size:12px;color:#9A9A9A;word-break:break-all;">{confirmUrl}</p>`,
  },
  customer_password_reset: {
    key: "customer_password_reset",
    label: "Reset hasła klienta",
    trigger: "Klient prosi o nowe hasło do konta.",
    tokens: ["resetButton", "resetUrl"],
    subject: "Reset hasła do konta · Trzy Wiatry",
    body: `<h1>Reset hasła</h1>
<p>Dostaliśmy prośbę o zmianę hasła do konta w sklepie Trzy Wiatry.</p>
{resetButton}
<p><strong>Uwaga!</strong> Link wygaśnie za 1 godzinę. Jeśli to nie Ty — zignoruj tę wiadomość.</p>
<p style="font-size:12px;color:#9A9A9A;word-break:break-all;">{resetUrl}</p>`,
  },
};

export const EMAIL_TEMPLATE_LIST = EMAIL_TEMPLATE_KEYS.map((key) => EMAIL_TEMPLATES[key]);

export function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return EMAIL_TEMPLATE_KEYS.includes(value as EmailTemplateKey);
}
