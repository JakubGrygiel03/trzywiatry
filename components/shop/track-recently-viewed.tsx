"use client";

import { useEffect } from "react";
import { getProductPhoto } from "@/lib/media";
import type { Product } from "@/lib/types";
import { trackShopEvent } from "@/lib/track-client";
import { useRecentlyViewedStore } from "@/store/use-recently-viewed-store";

/** Records a PDP visit into localStorage (WooCommerce-style recently viewed). */
export function TrackRecentlyViewed({ product }: { product: Product }) {
  const track = useRecentlyViewedStore((state) => state.track);

  useEffect(() => {
    const image = getProductPhoto(product) ?? product.images.find((src) => !src.endsWith("-01.png")) ?? product.images[0];
    track({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceInCents: product.priceInCents,
      image,
    });
    trackShopEvent("product_view", { slug: product.slug, path: `/sklep/${product.slug}` });
  }, [product.id, product.slug, product.name, product.priceInCents, product.images, track]);

  return null;
}
