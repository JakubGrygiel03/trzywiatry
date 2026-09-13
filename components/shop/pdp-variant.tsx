"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  findVariant,
  photosForVariant,
  variantCapacities,
  variantColors,
} from "@/lib/product-variants";
import type { Product, ProductVariant } from "@/lib/types";

type PdpVariantContextValue = {
  product: Product;
  variant: ProductVariant | undefined;
  photos: string[];
  color?: string;
  capacityMl?: number;
  setColor: (name: string) => void;
  setCapacityMl: (ml: number) => void;
  setVariantId: (id: string) => void;
};

const PdpVariantContext = createContext<PdpVariantContextValue | null>(null);

export function PdpVariantProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const colors = useMemo(() => variantColors(product), [product]);
  const capacities = useMemo(() => variantCapacities(product), [product]);
  const [color, setColor] = useState(colors[0]?.name);
  const [capacityMl, setCapacityMl] = useState(capacities[0]);
  const [variantId, setVariantId] = useState(product.variants[0]?.id);

  const structured = colors.length > 0 || capacities.length > 1;
  const variant = structured
    ? findVariant(product, color, capacityMl)
    : (product.variants.find((item) => item.id === variantId) ?? product.variants[0]);

  const photos = useMemo(() => photosForVariant(product, variant), [product, variant]);

  return (
    <PdpVariantContext.Provider
      value={{ product, variant, photos, color, capacityMl, setColor, setCapacityMl, setVariantId }}
    >
      {children}
    </PdpVariantContext.Provider>
  );
}

export function usePdpVariant() {
  const ctx = useContext(PdpVariantContext);
  if (!ctx) throw new Error("usePdpVariant must be used on the product page.");
  return ctx;
}
