import { CustomerRegisterForm } from "@/components/account/customer-register-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getCustomerSession } from "@/lib/customer-session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Rejestracja" };

export default async function RegisterPage({
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
          title="Załóż konto"
          description="Załóż konto, żeby śledzić zamówienia i szybciej wracać do kasy."
        />
        <CustomerRegisterForm error={blad} />
      </Container>
    </div>
  );
}
