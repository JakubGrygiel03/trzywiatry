import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductCard } from "@/components/shop/product-card";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getCollectionBySlug, getProductsByCollection } from "@/lib/data/queries";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  return { title: collection ? `Kolekcja ${collection.name}` : "Kolekcja" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();
  const products = getProductsByCollection(collection.id);

  return (
    <div>
      <div className="relative h-[42vh] min-h-64">
        <Image src={collection.imageUrl} alt={collection.name} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-czarny/55 via-czarny/15 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <Container className="pb-10 text-bialy">
            <p className="font-heading text-[11px] uppercase tracking-[0.28em] text-bialy/75">Kolekcja szkliw</p>
            <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.1em] md:text-7xl">{collection.name}</h1>
          </Container>
        </div>
      </div>
      <div className="py-16 md:py-20">
        <Container className="space-y-12">
          <SectionHeading description={collection.description} title="Naczynia w tym ogniu" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}
