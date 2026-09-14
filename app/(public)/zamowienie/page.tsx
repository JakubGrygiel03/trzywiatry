import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container, SectionHeading } from "@/components/ui/badge";
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
    <div className="py-14 md:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Kasa"
          title="Dostawa i płatność"
          description={
            hasP24Credentials()
              ? "Wybierz paczkomat na mapie albo kuriera. Płatność BLIK / karta przez Przelewy24 — potwierdzenie przyjdzie mailem."
              : "Podaj e-mail i dane dostawy. Zamówienie zapisujemy; o płatności damy znać mailem."
          }
        />
        {vacation ? (
          <p className="rounded-2xl bg-czerwony/15 px-4 py-3 text-sm leading-relaxed text-czarny/80">
            {vacation} Potwierdzenie e-mail też o tym przypomni.
          </p>
        ) : null}
        <CheckoutForm
          defaultEmail={customer?.email ?? ""}
          defaultName={customer?.name ?? ""}
          paymentsLive={hasP24Credentials()}
        />
      </Container>
    </div>
  );
}
