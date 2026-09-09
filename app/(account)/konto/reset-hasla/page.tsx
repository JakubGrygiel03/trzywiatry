import { CustomerForgotPasswordForm } from "@/components/account/customer-forgot-password-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reset hasła" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <Container className="max-w-md space-y-6">
        <SectionHeading
          eyebrow="Konto"
          title="Nie pamiętasz hasła?"
          description="Podaj e-mail konta — wyślemy jednorazowy link do ustawienia nowego hasła."
        />
        <CustomerForgotPasswordForm />
      </Container>
    </div>
  );
}
