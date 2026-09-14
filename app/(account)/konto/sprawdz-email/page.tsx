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

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  const user = await getCustomerSession();
  if (user) redirect("/konto");
  const { blad } = await searchParams;

  return (
    <div>
      <Container className="max-w-md space-y-6">
        <SectionHeading
          eyebrow="Konto"
          title="Sprawdź skrzynkę"
          description="Wysłaliśmy link potwierdzający. Kliknij w nim, żeby aktywować konto — to zabezpieczenie przed spamem. Link ważny 24 godziny."
        />
        {blad && ERRORS[blad] ? <p className="text-sm text-czerwony">{ERRORS[blad]}</p> : null}
        <CustomerResendConfirmForm />
      </Container>
    </div>
  );
}
