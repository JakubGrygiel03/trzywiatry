import { ProductCard } from "@/components/shop/product-card";
import type { UpsellSuggestion } from "@/lib/data/recommendations";
import type { Product } from "@/lib/types";

export function CrossSell({
  products,
  suggestions,
  title = "Inni kupili również",
  subtitle,
}: {
  products?: Product[];
  suggestions?: UpsellSuggestion[];
  title?: string;
  subtitle?: string;
}) {
  const items =
    suggestions?.map((item) => ({ product: item.product, reason: item.reason })) ??
    products?.map((product) => ({ product, reason: undefined })) ??
    [];

  if (items.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-heading text-xl uppercase tracking-[0.12em]">{title}</h2>
        {subtitle ? <p className="max-w-xl text-sm text-czarny/60">{subtitle}</p> : null}
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ product, reason }) => (
          <div key={product.id} className="space-y-2">
            {reason ? (
              <p className="px-1 font-heading text-[10px] uppercase tracking-[0.14em] text-czerwony">
                {reason}
              </p>
            ) : null}
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
