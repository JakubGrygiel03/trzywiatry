import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { SurfaceCanvas } from "@/components/layout/surface-canvas";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { getCustomerSession } from "@/lib/customer-session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Logowanie" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string; email?: string }>;
}) {
  const user = await getCustomerSession();
  if (user) redirect("/konto");
  const { blad, email } = await searchParams;

  return (
    <SurfaceCanvas>
      <div className="py-8 md:py-10">
        <Container className="max-w-md space-y-4 md:space-y-5">
          <SurfacePageIntro
            eyebrow="Konto"
            title="Zaloguj się"
            description="Zobaczysz tu zamówienia i ustawienia konta."
          />
          <SurfaceTile>
            <SurfaceTileBody>
              <CustomerLoginForm error={blad} defaultEmail={email?.trim().toLowerCase() ?? ""} />
            </SurfaceTileBody>
          </SurfaceTile>
        </Container>
      </div>
    </SurfaceCanvas>
  );
}
