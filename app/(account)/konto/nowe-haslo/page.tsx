import Link from "next/link";
import { CustomerResetPasswordForm } from "@/components/account/customer-reset-password-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nowe hasło" };

export default async function NewPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div>
      <Container className="max-w-md space-y-6">
        <SectionHeading
          eyebrow="Konto"
          title="Ustaw nowe hasło"
          description="Hasło musi mieć co najmniej 8 znaków."
        />
        {token ? (
          <CustomerResetPasswordForm token={token} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-czerwony">Brak tokenu resetu. Poproś o nowy link.</p>
            <Button asChild variant="outline">
              <Link href="/konto/reset-hasla">Reset hasła</Link>
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}
