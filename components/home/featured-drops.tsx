import Link from "next/link";
import { HomeSection } from "@/components/home/home-section";
import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { defaultFeaturedPayload, type FeaturedPayload } from "@/lib/cms/home-layout";
import { getFeaturedProducts } from "@/lib/data/queries";

export function FeaturedDrops({ payload = defaultFeaturedPayload() }: { payload?: FeaturedPayload }) {
  const products = getFeaturedProducts();

  return (
    <HomeSection>
      <Reveal>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex rounded-full border border-czerwony/40 px-4 py-1.5 font-heading text-[11px] uppercase tracking-[0.22em] text-czerwony">
              {payload.badge}
            </p>
            <h2 className="font-heading text-2xl uppercase leading-[1.2] tracking-[0.06em] text-czarny md:text-3xl">
              {payload.title}
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-czarny/80">{payload.description}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={payload.ctaHref}>{payload.ctaLabel}</Link>
          </Button>
        </div>
      </Reveal>
      {/* No per-card Reveal — products must paint immediately so the grid never looks finished early. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            framed
            tone="cream"
            imagePriority={index < 4}
          />
        ))}
      </div>
    </HomeSection>
  );
}
