import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/badge";
import {
  REGULAMIN_EFFECTIVE_DATE,
  privacySections,
  regulaminSections,
  renderLegalBlocks,
} from "@/lib/legal/shop-terms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin sklepu internetowego",
  description:
    "Regulamin sklepu internetowego Trzy Wiatry — zasady zamówień, płatności, dostawy, odstąpienia i reklamacji.",
};

export default function RegulaminPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-3xl space-y-12">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Sklep"
            title="Regulamin sklepu internetowego"
            description={`Obowiązuje od dnia ${REGULAMIN_EFFECTIVE_DATE}.`}
          />
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-czarny/55">
            <a href="#zalacznik-1" className="underline-offset-2 hover:text-czerwony hover:underline">
              Formularz odstąpienia
            </a>
            <Link href="/polityka-prywatnosci" className="underline-offset-2 hover:text-czerwony hover:underline">
              Polityka prywatności
            </Link>
            <Link href="/dostawa-i-zwroty" className="underline-offset-2 hover:text-czerwony hover:underline">
              Dostawa i zwroty
            </Link>
          </nav>
        </div>

        {regulaminSections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-24 space-y-4 border-b border-czarny/8 pb-8">
            <h2 className="font-heading text-base uppercase tracking-[0.08em] text-czarny">
              {section.title}
            </h2>
            <div className="space-y-4">{renderLegalBlocks(section.blocks)}</div>
          </article>
        ))}

        <section id="zalacznik-2" className="scroll-mt-24 space-y-6">
          <h2 className="font-heading text-base uppercase tracking-[0.08em] text-czarny">
            Załącznik nr 2 – Polityka prywatności
          </h2>
          <p className="text-sm leading-relaxed text-czarny/55">
            Pełna treść jest też dostępna pod adresem{" "}
            <Link href="/polityka-prywatnosci" className="text-czerwony underline-offset-2 hover:underline">
              /polityka-prywatnosci
            </Link>
            .
          </p>
          {privacySections.map((section) => (
            <article key={section.id} className="space-y-3">
              <h3 className="text-sm font-medium text-czarny">{section.title}</h3>
              <div className="space-y-3">{renderLegalBlocks(section.blocks)}</div>
            </article>
          ))}
        </section>
      </Container>
    </div>
  );
}
