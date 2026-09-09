import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getCustomerSession } from "@/lib/customer-session";
import { getSettings } from "@/lib/data/queries";
import { getVacationCheckoutNote } from "@/lib/vacation-message";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zamówienie",
  description: "Kasa Trzy Wiatry — InPost, kurier, pakowanie prezentowe, P24 i BLIK.",
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
          description="Podaj e-mail i dane dostawy. Płatność P24 / BLIK — potwierdzenie przyjdzie mailem."
        />
        {vacation ? (
          <p className="rounded-2xl bg-czerwony/15 px-4 py-3 text-sm leading-relaxed text-czarny/80">
            {vacation} Potwierdzenie e-mail też o tym przypomni.
          </p>
        ) : null}
        <CheckoutForm
          defaultEmail={customer?.email ?? ""}
          defaultName={customer?.name ?? ""}
        />
      </Container>
    </div>
  );
}
