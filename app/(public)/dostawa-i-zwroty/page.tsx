import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/badge";
import { SHIPPING_METHODS } from "@/lib/constants";
import { getSettings } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dostawa i zwroty" };

export default function ShippingPage() {
  const freeFrom = formatPLN(getSettings().freeShippingThresholdCents);
  const inpost = SHIPPING_METHODS.find((method) => method.id === "inpost");
  const kurier = SHIPPING_METHODS.find((method) => method.id === "kurier");

  return (
    <div className="py-14 md:py-20">
      <Container className="max-w-3xl space-y-8">
        <SectionHeading
          eyebrow="Logistyka"
          title="Dostawa i zwroty"
          description="Pakujemy z wkładkami i podwójnym kartonem — zero stłuczek. InPost, kurier albo odbiór w Gdańsku."
        />
        <p className="leading-relaxed text-czarny/75">
          Darmowa dostawa od {freeFrom} (Polska, bez przesyłek gabarytowych). Poniżej progu: Paczkomat{" "}
          {inpost ? formatPLN(inpost.priceInCents) : "20 zł"}, kurier{" "}
          {kurier ? formatPLN(kurier.priceInCents) : "30 zł"}, odbiór w pracowni — 0 zł.
        </p>
        <p className="leading-relaxed text-czarny/75">
          Produkty dostępne wysyłamy w 1–5 dni roboczych, produkty na zamówienie w 3–14 dni roboczych. Doręczenie
          przez przewoźnika: zwykle 1–3 dni robocze od nadania.
        </p>
        <p className="leading-relaxed text-czarny/75">
          Masz 14 dni na odstąpienie, jeśli naczynie nie jest personalizowane. Odeślij je bezpiecznie zapakowane.
          Formularz odstąpienia oraz pełne zasady znajdziesz w{" "}
          <Link href="/regulamin#zalacznik-1" className="text-czerwony underline-offset-2 hover:underline">
            regulaminie
          </Link>
          .
        </p>
        <p className="leading-relaxed text-czarny/75">
          Numer śledzenia trafia mailem, gdy nadamy paczkę. W trybie urlopowym data nadania jest w bannerze i w
          potwierdzeniu.
        </p>
      </Container>
    </div>
  );
}
