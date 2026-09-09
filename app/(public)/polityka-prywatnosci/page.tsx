import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/badge";
import { privacySections, renderLegalBlocks } from "@/lib/legal/shop-terms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Polityka prywatności sklepu Trzy Wiatry — RODO, cele przetwarzania danych, cookies i prawa klienta.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-3xl space-y-10">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="RODO"
            title="Polityka prywatności"
            description="Załącznik nr 2 do Regulaminu sklepu internetowego Trzy Wiatry."
          />
          <Link href="/regulamin" className="text-sm text-czerwony underline-offset-2 hover:underline">
            ← Wróć do regulaminu
          </Link>
        </div>

        {privacySections.map((section) => (
          <article key={section.id} className="space-y-3 border-b border-czarny/8 pb-6">
            <h2 className="font-heading text-base uppercase tracking-[0.08em] text-czarny">
              {section.title}
            </h2>
            <div className="space-y-3">{renderLegalBlocks(section.blocks)}</div>
          </article>
        ))}
      </Container>
    </div>
  );
}
