import Image from "next/image";
import Link from "next/link";
import { ProductCardCartButton } from "@/components/shop/product-card-cart-button";
import { PriceBubble } from "@/components/ui/badge";
import { categoryFrame } from "@/lib/category-frame";
import { CATEGORY_LABELS, DOMAIN_LABELS } from "@/lib/constants";
import { formatPLN } from "@/lib/format";
import { getProductPhoto } from "@/lib/media";
import { variantStockLabel } from "@/lib/data/queries";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product, framed = false }: { product: Product; framed?: boolean }) {
  const stock = product.variants.reduce((sum, variant) => {
    if (!variant.isAvailable) return sum;
    return sum + variant.stockQuantity;
  }, 0);
  const status = variantStockLabel(stock, product.lowStockThreshold);
  const photo = getProductPhoto(product);
  const categoryLabel = CATEGORY_LABELS[product.category] ?? DOMAIN_LABELS[product.domain];
  const frame = categoryFrame(product.category);

  return (
    <article
      className={cn(
        "group relative space-y-2 p-2.5",
        "bg-bialy",
        frame.card,
      )}
    >
      <Link href={`/sklep/${product.slug}`} className="block space-y-2">
        <div className={cn("relative aspect-square overflow-hidden bg-krem", frame.photo)}>
          {photo ? (
            <Image
              src={photo}
              alt={product.name}
              fill
              className="img-hover-soft object-cover will-change-transform"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : null}
          {framed ? (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-czerwony px-2.5 py-1 font-heading text-[9px] uppercase tracking-[0.16em] text-bialy">
              Bestseller
            </span>
          ) : null}
          {status === "sold_out" ? (
            <div className="absolute inset-x-0 bottom-[18%] z-10 bg-bialy/85 py-1.5 text-center">
              <span className="font-heading text-[10px] uppercase tracking-[0.14em] text-ceglany">
                Brak w magazynie
              </span>
            </div>
          ) : null}
        </div>
        <div className="space-y-1 px-0.5">
          <p className="text-xs tracking-wide text-szary">{categoryLabel}</p>
          <h3 className="font-heading text-sm uppercase tracking-[0.08em] text-czarny">{product.name}</h3>
          {framed ? (
            <PriceBubble>{formatPLN(product.priceInCents)}</PriceBubble>
          ) : (
            <p className="text-sm font-medium text-czarny">{formatPLN(product.priceInCents)}</p>
          )}
        </div>
      </Link>
      {status !== "sold_out" ? <ProductCardCartButton product={product} /> : null}
    </article>
  );
}
