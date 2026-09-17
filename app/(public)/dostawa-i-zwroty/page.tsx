import Link from "next/link";
import { SurfacePageIntro, SurfaceProse } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SHIPPING_METHODS } from "@/lib/constants";
import { getSettings } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Dostawa i zwroty",
  description:
    "Paczkomaty InPost i kurier. Pakowanie zero stłuczek i zasady zwrotów w Trzy Wiatry.",
  path: "/dostawa-i-zwroty",
});

export default function ShippingPage() {
  const freeFrom = formatPLN(getSettings().freeShippingThresholdCents);
  const inpost = SHIPPING_METHODS.find((method) => method.id === "inpost");
  const kurier = SHIPPING_METHODS.find((method) => method.id === "kurier");

  return (
    <div className="py-8 md:py-10">
      <Container className="max-w-3xl space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow="Logistyka"
          title="Dostawa i zwroty"
          description="Pakujemy z wkładkami i podwójnym kartonem — zero stłuczek. Paczkomat InPost albo kurier."
        />
        <SurfaceProse>
          <p>
            Darmowa dostawa od {freeFrom} (Polska, bez przesyłek gabarytowych). Poniżej progu: Paczkomat{" "}
            {inpost ? formatPLN(inpost.priceInCents) : "20 zł"}, kurier{" "}
            {kurier ? formatPLN(kurier.priceInCents) : "30 zł"}.
          </p>
          <p>
            Produkty dostępne wysyłamy w 1–5 dni roboczych, produkty na zamówienie w 3–14 dni roboczych.
            Doręczenie przez przewoźnika: zwykle 1–3 dni robocze od nadania.
          </p>
          <p>
            Masz 14 dni na odstąpienie, jeśli naczynie nie jest personalizowane. Odeślij je bezpiecznie
            zapakowane. Formularz odstąpienia oraz pełne zasady znajdziesz w{" "}
            <Link href="/regulamin#zalacznik-1" className="text-czerwony underline-offset-2 hover:underline">
              regulaminie
            </Link>
            .
          </p>
          <p>
            Numer śledzenia trafia mailem, gdy nadamy paczkę. W trybie urlopowym data nadania jest w bannerze i
            w potwierdzeniu.
          </p>
        </SurfaceProse>
      </Container>
    </div>
  );
}
