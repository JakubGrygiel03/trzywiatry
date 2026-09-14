import { CustomerResendConfirmForm } from "@/components/account/customer-resend-confirm-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getCustomerSession } from "@/lib/customer-session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Potwierdź e-mail" };

const ERRORS: Record<string, string> = {
  link: "Link jest nieprawidłowy. Wyślij nowy na ten sam adres.",
  wygasl: "Link wygasł. Wyślij nowy — ważny 24 godziny.",
};

function safeEmail(raw?: string) {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value || value.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "";
  return value;
}

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string; email?: string; mail?: string }>;
}) {
  const user = await getCustomerSession();
  if (user) redirect("/konto");
  const { blad, email, mail } = await searchParams;
  const defaultEmail = safeEmail(email);

  return (
    <div>
      <Container className="max-w-md space-y-6">
        <SectionHeading
          eyebrow="Konto"
          title="Sprawdź skrzynkę"
          description="Konto czeka na klik w mailu. Jeśli wiadomość nie doszła — wyślij link ponownie poniżej."
        />
        {blad && ERRORS[blad] ? <p className="text-sm text-czerwony">{ERRORS[blad]}</p> : null}
        <CustomerResendConfirmForm defaultEmail={defaultEmail} firstMailFailed={mail === "0"} />
      </Container>
    </div>
  );
}
