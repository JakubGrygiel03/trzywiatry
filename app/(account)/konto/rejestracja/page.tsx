import { CustomerRegisterForm } from "@/components/account/customer-register-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getCustomerSession } from "@/lib/customer-session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Rejestracja" };

export default async function RegisterPage() {
  const user = await getCustomerSession();
  if (user) redirect("/konto");

  return (
    <div>
      <Container className="max-w-md space-y-6">
        <SectionHeading
          eyebrow="Konto"
          title="Załóż konto"
          description="Zapiszesz zamówienia i wrócisz do nich w dowolnym momencie."
        />
        <CustomerRegisterForm />
      </Container>
    </div>
  );
}
