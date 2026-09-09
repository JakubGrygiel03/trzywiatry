import { AddToCart } from "@/components/shop/add-to-cart";
import { CrossSell } from "@/components/shop/cross-sell";
import { RecentlyViewed } from "@/components/shop/recently-viewed";
import { TrackRecentlyViewed } from "@/components/shop/track-recently-viewed";
import { UpsellRail } from "@/components/shop/upsell-rail";
import { ProductGallery } from "@/components/shop/product-gallery";
import { Badge, Container } from "@/components/ui/badge";
import { DOMAIN_LABELS } from "@/lib/constants";
import { getCollections, getProductBySlug, variantStockLabel } from "@/lib/data/queries";
import { getProductUpsells } from "@/lib/data/recommendations";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produkt" };
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const stock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const status = variantStockLabel(stock, product.lowStockThreshold);
  const collection = getCollections().find((item) => item.id === product.collectionId);
  const upsells = getProductUpsells(product, 4);

  return (
    <div className="py-10 md:py-14">
      <TrackRecentlyViewed product={product} />
      <Container className="space-y-12 md:space-y-16">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
          <div className="lg:sticky lg:top-24">
            <ProductGallery product={product} />
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge>{DOMAIN_LABELS[product.domain]}</Badge>
              {product.capacityMl ? <Badge>{product.capacityMl} ml</Badge> : null}
              {product.isBestseller ? <Badge tone="clay">Bestseller</Badge> : null}
              {status === "sold_out" ? <Badge tone="sold">Wyprzedane</Badge> : null}
              {status === "low" ? <Badge tone="low">Niski stan</Badge> : null}
            </div>
            <h1 className="font-heading text-3xl uppercase tracking-[0.08em] md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {product.name}
            </h1>
            {collection ? (
              <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-szary">
                Kolekcja {collection.name}
              </p>
            ) : null}
            <p className="text-base leading-relaxed text-czarny/70 md:text-lg">{product.description}</p>
            {product.careInstructions ? (
              <p className="border-t border-czarny/8 pt-4 text-sm leading-relaxed text-czarny/55">
                {product.careInstructions}
              </p>
            ) : null}
            <AddToCart product={product} />
          </div>
        </div>

        <UpsellRail suggestions={upsells.slice(0, 2)} title="Często dobierane razem" />

        <CrossSell
          suggestions={upsells}
          title="Dobierz zestaw do stołu"
          subtitle="Ta sama kolekcja szkliwa, dopełniające formy albo gotowy zestaw prezentowy."
        />
        <RecentlyViewed excludeId={product.id} />
      </Container>
    </div>
  );
}
