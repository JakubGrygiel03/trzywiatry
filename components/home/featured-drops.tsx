import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/badge";
import { getFeaturedProducts } from "@/lib/data/queries";

export function FeaturedDrops() {
  const products = getFeaturedProducts();

  return (
    <section className="bg-krem py-12 md:py-16">
      <Container className="space-y-8">
        <Reveal>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="inline-flex rounded-full border border-czerwony px-4 py-1.5 font-heading text-[11px] uppercase tracking-[0.22em] text-czerwony">
                Bestseller
              </p>
              <h2 className="font-heading text-2xl uppercase leading-[1.2] tracking-[0.06em] text-czarny md:text-3xl">
                Naczynia ze stołu pracowni
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-czarny">
                Formy, które wracają do kawiarni i domów — wybór z półki, nie z promocji.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/sklep">Cały katalog</Link>
            </Button>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={Math.min(index, 3) * 0.05}>
              <ProductCard product={product} framed />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
