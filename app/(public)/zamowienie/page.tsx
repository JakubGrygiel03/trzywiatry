import { CheckoutGate } from "@/components/checkout/checkout-gate";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { getCustomerSession } from "@/lib/customer-session";
import { getSettings } from "@/lib/data/queries";
import { hasP24Credentials } from "@/lib/p24";
import { getVacationCheckoutNote } from "@/lib/vacation-message";
import { noIndexRobots } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zamówienie",
  description: "Kasa Trzy Wiatry — InPost, kurier, pakowanie prezentowe, P24 i BLIK.",
  robots: noIndexRobots,
};

export default async function CheckoutPage() {
  const vacation = getVacationCheckoutNote(getSettings());
  const customer = await getCustomerSession();

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow="Kasa"
          title="Dostawa i płatność"
          description={
            hasP24Credentials()
              ? "Wybierz paczkomat na mapie albo kuriera. Płatność BLIK / karta przez Przelewy24 — potwierdzenie przyjdzie mailem."
              : "Podaj e-mail i dane dostawy. Zamówienie zapisujemy; o płatności damy znać mailem."
          }
        />
        {vacation ? (
          <SurfaceTile>
            <SurfaceTileBody>
              <p className="text-[14px] leading-relaxed text-czerwony">
                {vacation} Potwierdzenie e-mail też o tym przypomni.
              </p>
            </SurfaceTileBody>
          </SurfaceTile>
        ) : null}
        <CheckoutGate
          defaultEmail={customer?.email ?? ""}
          defaultName={customer?.name ?? ""}
          paymentsLive={hasP24Credentials()}
        />
      </Container>
    </div>
  );
}
