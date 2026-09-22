import { z } from "zod";
import { bi } from "@/lib/i18n/public";
import { NATIONAL_PHONE_DIGITS, PHONE_COUNTRIES } from "@/lib/phone";

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;
const HTML_MARK = /[<>]/;
const UNSAFE_HTML =
  /<script|javascript:|data:text\/html|on\w+\s*=|<iframe|<object|<embed|<link[\s>]|<meta[\s>]/i;

export function firstZodMessage(error: z.ZodError<unknown>, fallback = "Sprawdź pola i spróbuj ponownie.") {
  return error.issues[0]?.message ?? fallback;
}

export function normalizeHref(value: string) {
  let href = value.trim();
  if (
    (href.startsWith('"') && href.endsWith('"')) ||
    (href.startsWith("'") && href.endsWith("'"))
  ) {
    href = href.slice(1, -1).trim();
  }
  if (!href) return href;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) return href;
  if (href.startsWith("//") || href.startsWith("#") || href.startsWith("/")) return href;
  return `/${href}`;
}

export function isSafeHref(value: string) {
  const href = normalizeHref(value);
  if (!href || href.includes("..") || href.includes("\\") || /\s/.test(href)) return false;
  if (href.startsWith("#") && href.length <= 180) return true;
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("://")) return href.length <= 180;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function hasUnsafeEmailHtml(html: string) {
  return UNSAFE_HTML.test(html);
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function plainText(label: string, max: number, min = 0) {
  return z.string().trim().superRefine((value, ctx) => {
    if (min > 0 && value.length < min) {
      ctx.addIssue({
        code: "custom",
        message:
          value.length === 0
            ? `${label} nie może być puste.`
            : `${label}: wpisz co najmniej ${min} znaków.`,
      });
      return;
    }
    if (value.length > max) {
      ctx.addIssue({ code: "custom", message: `${label}: maksymalnie ${max} znaków.` });
    }
    if (CONTROL.test(value)) {
      ctx.addIssue({ code: "custom", message: `${label}: usuń niewidoczne znaki.` });
    }
    if (HTML_MARK.test(value)) {
      ctx.addIssue({ code: "custom", message: `${label}: wklej sam tekst, bez HTML.` });
    }
  });
}

export const safeHrefSchema = z
  .string()
  .trim()
  .min(1, "Podaj link.")
  .max(180, "Link jest za długi.")
  .transform(normalizeHref)
  .refine(isSafeHref, "Link wewnętrzny (np. /kolekcje/mist albo /sklep) albo adres https://.");

export const emailSchema = z
  .string()
  .trim()
  .max(120, bi("E-mail jest za długi.", "Email is too long."))
  .email(bi("Podaj prawidłowy e-mail.", "Enter a valid email."));

/** E.164 from PhoneField (+48 + 9 national digits). Also accepts spaced/dashed input. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()./-]/g, ""))
  .refine((value) => /^\+\d{10,15}$/.test(value), {
    message: bi("Podaj numer z kierunkiem, np. +48 123 456 789.", "Include country code, e.g. +48 123 456 789."),
  })
  .refine(
    (value) => {
      const digits = value.slice(1);
      const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
      for (const country of sorted) {
        if (!digits.startsWith(country.dial)) continue;
        return digits.length === country.dial.length + NATIONAL_PHONE_DIGITS;
      }
      return false;
    },
    {
      message: bi(
        "Numer krajowy: dokładnie 9 cyfr (np. 123-456-789).",
        "National number: exactly 9 digits (e.g. 123-456-789).",
      ),
    },
  );

export const taxIdSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, "").toUpperCase())
  .refine(
    (value) => value === "" || /^[A-Z0-9]{8,16}$/.test(value),
    bi("NIP (10 cyfr) albo VAT, np. DE123456789.", "PL NIP (10 digits) or VAT, e.g. DE123456789."),
  );

export const promoCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => value === "" || /^[A-Z0-9-]{2,24}$/.test(value), {
    message: "Kod: same litery, cyfry i myślnik, bez spacji (np. WIOSNA).",
  });

export const isoDateSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Data w formacie RRRR-MM-DD.");
