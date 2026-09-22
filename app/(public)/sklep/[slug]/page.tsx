import { AddToCart } from "@/components/shop/add-to-cart";
import { PdpVariantProvider } from "@/components/shop/pdp-variant";
import { CrossSell } from "@/components/shop/cross-sell";
import { RecentlyViewed } from "@/components/shop/recently-viewed";
import { TrackRecentlyViewed } from "@/components/shop/track-recently-viewed";
import { ScrollProductToTop } from "@/components/shop/scroll-product-to-top";
import { UpsellRail } from "@/components/shop/upsell-rail";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductLongCopy } from "@/components/shop/product-long-copy";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge, Container } from "@/components/ui/badge";
import { DOMAIN_LABELS } from "@/lib/constants";
import { getCollections, getProductBySlug, isAliasedProductSlug, resolveProductSlug, variantStockLabel } from "@/lib/data/queries";
import { getProductUpsells, getUpsellCopy } from "@/lib/data/recommendations";
import { getProductPhoto } from "@/lib/media";
import { splitProductCopy } from "@/lib/product-copy";
import { breadcrumbJsonLd, noIndexRobots, pageMetadata, productJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produkt", robots: noIndexRobots };
  const description = product.metaDescription ?? product.description;
  return pageMetadata({
    title: product.metaTitle ?? product.name,
    description,
    path: `/sklep/${product.slug}`,
    image: getProductPhoto(product),
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (isAliasedProductSlug(slug)) permanentRedirect(`/sklep/${resolveProductSlug(slug)}`);
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const stock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const status = variantStockLabel(stock, product.lowStockThreshold);
  const collection = getCollections().find((item) => item.id === product.collectionId);
  const upsells = getProductUpsells(product, 4);
  const upsellCopy = getUpsellCopy(product);
  const { short, long } = splitProductCopy(product);

  return (
    <div className="product-pdp overflow-anchor-none py-8 md:py-14" key={product.slug}>
      <ScrollProductToTop slug={product.slug} />
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Sklep", path: "/sklep" },
            { name: product.name, path: `/sklep/${product.slug}` },
          ]),
        ]}
      />
      <TrackRecentlyViewed product={product} />
      <Container className="space-y-12 md:space-y-16">
        <PdpVariantProvider key={product.id} product={product}>
          {/*
            Mobile: title → gallery → buy (order-*).
            Desktop: one right-hand column so the short line sits under the title, not a row below the photos.
          */}
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
            <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-5">
              <header className="order-1 space-y-3 lg:order-none">
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
              </header>

              <div className="order-3 space-y-5 lg:order-none">
                {short ? <p className="text-base leading-relaxed text-czarny/70 md:text-lg">{short}</p> : null}
                <AddToCart product={product} />
                {long || product.careInstructions ? (
                  <section className="border-t border-czarny/8 pt-5" aria-label="Opis produktu">
                    {long ? <ProductLongCopy text={long} /> : null}
                    {product.careInstructions ? (
                      <p className="mt-4 text-sm leading-relaxed text-czarny/55">{product.careInstructions}</p>
                    ) : null}
                  </section>
                ) : null}
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-1 lg:sticky lg:top-24">
              <ProductGallery product={product} />
            </div>
          </div>
        </PdpVariantProvider>

        {upsells.length > 0 ? (
          <>
            <UpsellRail
              suggestions={upsells.slice(0, 2)}
              title="Często dobierane razem"
              subtitle={upsellCopy.rail}
            />
            <CrossSell suggestions={upsells} title={upsellCopy.title} subtitle={upsellCopy.subtitle} />
          </>
        ) : null}
        <RecentlyViewed excludeId={product.id} />
      </Container>
    </div>
  );
}
