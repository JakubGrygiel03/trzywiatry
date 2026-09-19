import { emailSchema } from "@/lib/validations/safe-input";

/** Live hints while typing — empty until the user starts / blurs. */
export function emailLiveError(value: string, opts?: { required?: boolean; touched?: boolean }): string | null {
  const required = opts?.required ?? true;
  const touched = opts?.touched ?? true;
  const trimmed = value.trim();

  if (!trimmed) {
    if (!touched) return null;
    return required ? "Podaj adres e-mail." : null;
  }

  if (!trimmed.includes("@")) {
    return "W adresie brakuje znaku @.";
  }

  const [local, domain = ""] = trimmed.split("@");
  if (!local) return "Wpisz część przed znakiem @.";
  if (!domain) return "Dopisz domenę po @ (np. gmail.com).";
  if (!domain.includes(".")) return "Domena powinna mieć kropkę (np. nazwa.pl).";
  if (domain.endsWith(".")) return "Domena nie może kończyć się kropką.";
  if (trimmed.includes(" ")) return "E-mail nie może zawierać spacji.";

  const parsed = emailSchema.safeParse(trimmed);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Podaj prawidłowy e-mail.";
  }
  return null;
}

export function nameLiveError(value: string, opts?: { required?: boolean; touched?: boolean; label?: string }): string | null {
  const required = opts?.required ?? true;
  const touched = opts?.touched ?? true;
  const label = opts?.label ?? "To pole";
  const trimmed = value.trim();

  if (!trimmed) {
    if (!touched) return null;
    return required ? `${label} nie może być puste.` : null;
  }
  if (trimmed.length < 2) return `${label}: wpisz co najmniej 2 znaki.`;
  if (trimmed.length > 80) return `${label}: maksymalnie 80 znaków.`;
  if (/[<>]/.test(trimmed)) return `${label}: wklej sam tekst, bez HTML.`;
  if (/^\d+$/.test(trimmed)) return `${label}: to nie wygląda na imię.`;
  return null;
}
