/** Shared phone helpers for storefront forms (PL default, 9 national digits). */

export const NATIONAL_PHONE_DIGITS = 9;

export const PHONE_COUNTRIES = [
  { dial: "48", label: "Polska", hint: "+48" },
  { dial: "49", label: "Niemcy", hint: "+49" },
  { dial: "420", label: "Czechy", hint: "+420" },
  { dial: "421", label: "Słowacja", hint: "+421" },
  { dial: "380", label: "Ukraina", hint: "+380" },
  { dial: "44", label: "Wielka Brytania", hint: "+44" },
  { dial: "1", label: "USA / Kanada", hint: "+1" },
  { dial: "33", label: "Francja", hint: "+33" },
  { dial: "39", label: "Włochy", hint: "+39" },
] as const;

export type PhoneCountryDial = (typeof PHONE_COUNTRIES)[number]["dial"];

/** Digits only, max 9 — display as 123-456-789. */
export function formatNationalPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, NATIONAL_PHONE_DIGITS);
  const chunks: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    chunks.push(digits.slice(i, i + 3));
  }
  return chunks.join("-");
}

export function nationalDigitsOnly(formatted: string): string {
  return formatted.replace(/\D/g, "").slice(0, NATIONAL_PHONE_DIGITS);
}

export function toE164(dial: string, nationalFormatted: string): string {
  const national = nationalDigitsOnly(nationalFormatted);
  return national ? `+${dial}${national}` : "";
}

/** Split a stored E.164 / free-text phone into dial + national display. */
export function splitPhone(value: string): { dial: string; national: string } {
  const trimmed = value.trim();
  if (!trimmed) return { dial: "48", national: "" };

  const digits = trimmed.replace(/\D/g, "");
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

  for (const country of sorted) {
    if (digits.startsWith(country.dial) && digits.length > country.dial.length) {
      return {
        dial: country.dial,
        national: formatNationalPhone(digits.slice(country.dial.length)),
      };
    }
  }

  // Bare PL mobile (9 digits, often starts with 5/6/7/8)
  if (digits.length === NATIONAL_PHONE_DIGITS) {
    return { dial: "48", national: formatNationalPhone(digits) };
  }

  return { dial: "48", national: formatNationalPhone(digits) };
}

/** Human-readable phone for emails / admin: +48 123 456 789 */
export function formatPhoneDisplay(value: string): string {
  if (!value.trim()) return "";
  const { dial, national } = splitPhone(value);
  return national ? `+${dial} ${national.replace(/-/g, " ")}` : value.trim();
}

export function phoneLiveError(dial: string, nationalFormatted: string, required: boolean): string | null {
  const national = nationalDigitsOnly(nationalFormatted);
  if (!national) {
    return required ? "Podaj numer telefonu." : null;
  }
  if (national.length < NATIONAL_PHONE_DIGITS) {
    return `Numer powinien mieć ${NATIONAL_PHONE_DIGITS} cyfr (wpisano ${national.length}).`;
  }
  if (national.length > NATIONAL_PHONE_DIGITS) {
    return `Maksymalnie ${NATIONAL_PHONE_DIGITS} cyfr numeru.`;
  }
  if (!/^\d+$/.test(dial)) {
    return "Wybierz kod kraju.";
  }
  return null;
}
