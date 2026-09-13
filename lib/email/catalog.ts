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

export const EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplateMeta> = {
  order_placed: {
    key: "order_placed",
    label: "Zamówienie przyjęte",
    trigger: "Klient składa zamówienie w kasie.",
    tokens: ["customerName", "orderNumber", "items", "total", "vacationBlock"],
    subject: "Zamówienie {orderNumber} · przyjęte i w realizacji",
    body: `<h1 style="font-size:22px">Zamówienie {orderNumber} przyjęte</h1>
<p>Cześć {customerName}, dziękujemy. Płatność przyjęliśmy i <strong>rozpoczęliśmy realizację</strong> Twojego zamówienia.</p>
{vacationBlock}
<ul>{items}</ul>
<p><strong>Razem:</strong> {total}</p>
<p>Pakujemy ręcznie, ze wkładkami — zero stłuczek. Dam znać mailem, gdy paczka wyjdzie z pracowni.</p>
<p>Status zamówienia śledzisz też po zalogowaniu na konto w sklepie.</p>`,
  },
  order_pending: {
    key: "order_pending",
    label: "Oczekuje na płatność",
    trigger: "Admin ustawia status „oczekuje na płatność”.",
    tokens: ["customerName", "orderNumber"],
    subject: "Zamówienie {orderNumber} · oczekuje na płatność",
    body: `<h1 style="font-size:22px">Czekamy na płatność</h1>
<p>Cześć {customerName}, zamówienie <strong>{orderNumber}</strong> jest u nas, ale jeszcze nie widzimy płatności.</p>
<p>Jak tylko przelew / BLIK przejdzie, od razu ruszamy z pakowaniem.</p>`,
  },
  order_paid: {
    key: "order_paid",
    label: "Płatność potwierdzona",
    trigger: "Płatność P24 / zmiana statusu na „opłacone”.",
    tokens: ["customerName", "orderNumber", "total"],
    subject: "Zamówienie {orderNumber} · płatność potwierdzona",
    body: `<h1 style="font-size:22px">Płatność potwierdzona</h1>
<p>Cześć {customerName}, zamówienie <strong>{orderNumber}</strong> jest opłacone ({total}).</p>
<p>Zaraz zaczynamy przygotowanie paczki.</p>`,
  },
  order_processing: {
    key: "order_processing",
    label: "W realizacji",
    trigger: "Admin oznacza zamówienie jako „w realizacji”.",
    tokens: ["customerName", "orderNumber", "statusLabel", "items"],
    subject: "Zamówienie {orderNumber} · rozpoczęliśmy realizację",
    body: `<h1 style="font-size:22px">Zaczynamy pakować</h1>
<p>Cześć {customerName}, status zamówienia <strong>{orderNumber}</strong>: <em>{statusLabel}</em>.</p>
<p>Piec, wióry i karton — Twoja paczka jest w toku. Dam znać, gdy wyjdzie z pracowni.</p>
<ul>{items}</ul>`,
  },
  order_shipped: {
    key: "order_shipped",
    label: "Paczka wysłana",
    trigger: "Admin ustawia status „wysłane” i numer śledzenia.",
    tokens: ["customerName", "orderNumber", "trackingBlock"],
    subject: "Zamówienie {orderNumber} · paczka w drodze",
    body: `<h1 style="font-size:22px">Paczka wyszła z pracowni</h1>
<p>Cześć {customerName}, zamówienie <strong>{orderNumber}</strong> jest już w drodze.</p>
{trackingBlock}
<p>Trzymaj kciuki za zero stłuczek — pakujemy podwójnie.</p>`,
  },
  order_completed: {
    key: "order_completed",
    label: "Zamówienie zakończone",
    trigger: "Admin oznacza zamówienie jako dostarczone.",
    tokens: ["customerName", "orderNumber"],
    subject: "Zamówienie {orderNumber} · dostarczone",
    body: `<h1 style="font-size:22px">Zamówienie zakończone</h1>
<p>Cześć {customerName}, zamówienie <strong>{orderNumber}</strong> oznaczyliśmy jako zakończone.</p>
<p>Dziękujemy za wsparcie lokalnego rzemiosła. Do zobaczenia przy kolejnej czarce.</p>`,
  },
  order_cancelled: {
    key: "order_cancelled",
    label: "Zamówienie anulowane",
    trigger: "Admin anuluje zamówienie.",
    tokens: ["customerName", "orderNumber", "studioEmail"],
    subject: "Zamówienie {orderNumber} · anulowane",
    body: `<h1 style="font-size:22px">Zamówienie anulowane</h1>
<p>Cześć {customerName}, zamówienie <strong>{orderNumber}</strong> zostało anulowane.</p>
<p>Jeśli to pomyłka — napisz na {studioEmail}, ogarniemy.</p>`,
  },
  newsletter_welcome: {
    key: "newsletter_welcome",
    label: "Newsletter — kod rabatowy",
    trigger: "Klient zapisuje się na newsletter.",
    tokens: ["code"],
    subject: "Twój kod {code} · Trzy Wiatry",
    body: `<p>Witaj w pracowni. Twój kod rabatowy: <strong>{code}</strong>.</p>`,
  },
  workshop_ticket: {
    key: "workshop_ticket",
    label: "Bilet na warsztat",
    trigger: "Klient rezerwuje miejsce na warsztat.",
    tokens: ["workshopTitle", "seatsCount"],
    subject: "Bilet · {workshopTitle}",
    body: `<p>Rezerwacja potwierdzona: {workshopTitle}. Liczba miejsc: {seatsCount}.</p>`,
  },
  customer_password_reset: {
    key: "customer_password_reset",
    label: "Reset hasła klienta",
    trigger: "Klient prosi o nowe hasło do konta.",
    tokens: ["resetButton", "resetUrl"],
    subject: "Reset hasła do konta · Trzy Wiatry",
    body: `<h1 style="font-size:22px">Reset hasła</h1>
<p>Dostaliśmy prośbę o zmianę hasła do konta w sklepie Trzy Wiatry.</p>
<p style="margin:24px 0">{resetButton}</p>
<p style="font-size:13px;color:#666">Link ważny 1 godzinę. Jeśli to nie Ty — zignoruj tę wiadomość.</p>
<p style="font-size:12px;color:#999;word-break:break-all">{resetUrl}</p>`,
  },
};

export const EMAIL_TEMPLATE_LIST = EMAIL_TEMPLATE_KEYS.map((key) => EMAIL_TEMPLATES[key]);

export function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return EMAIL_TEMPLATE_KEYS.includes(value as EmailTemplateKey);
}
