import Link from "next/link";
import { SurfacePageIntro, SurfaceProse } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { getContentPage } from "@/lib/data/content-pages";
import { getSettings } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { enabledShippingMethods } from "@/lib/shipping";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("dostawa-i-zwroty");
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/dostawa-i-zwroty",
  });
}

export default async function ShippingPage() {
  const page = await getContentPage("dostawa-i-zwroty");
  const settings = getSettings();
  const freeFrom = formatPLN(settings.freeShippingThresholdCents);
  const methods = enabledShippingMethods(settings);
  const priceLine = methods
    .map((method) =>
      method.priceInCents === 0 ? `${method.label} 0 zł` : `${method.label} ${formatPLN(method.priceInCents)}`,
    )
    .join(", ");

  return (
    <div className="py-8 md:py-10">
      <Container className="max-w-3xl space-y-4 md:space-y-5">
        <SurfacePageIntro eyebrow={page.eyebrow} title={page.title} description={page.description} />
        <SurfaceProse>
          <p>
            Darmowa dostawa od {freeFrom} (Polska, bez przesyłek gabarytowych{methods.some((method) => method.id === "odbior") ? ", poza odbiorem w pracowni" : ""}). Poniżej progu: {priceLine || "brak włączonych metod — uzupełnij je w ustawieniach sklepu"}.
          </p>
        </SurfaceProse>
        {page.items.map((section) => (
          <SurfaceTile key={section.title}>
            <SurfaceTileHeader title={section.title} />
            <SurfaceTileBody>
              <p className="text-[15px] leading-relaxed text-czarny/70 md:text-base md:leading-[1.75]">
                {section.body}{" "}
                {section.title.toLowerCase().includes("zwrot") ? (
                  <Link href="/regulamin#zalacznik-1" className="text-czerwony underline-offset-2 hover:underline">
                    Regulamin
                  </Link>
                ) : null}
              </p>
            </SurfaceTileBody>
          </SurfaceTile>
        ))}
      </Container>
    </div>
  );
}
