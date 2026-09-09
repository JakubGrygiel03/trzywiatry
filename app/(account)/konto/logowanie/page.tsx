import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getCustomerSession } from "@/lib/customer-session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Logowanie" };

export default async function LoginPage() {
  const user = await getCustomerSession();
  if (user) redirect("/konto");

  return (
    <div>
      <Container className="max-w-md space-y-6">
        <SectionHeading
          eyebrow="Konto"
          title="Zaloguj się"
          description="Zobaczysz tu zamówienia i ustawienia konta."
        />
        <CustomerLoginForm />
      </Container>
    </div>
  );
}
