"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";
import { studioSettings } from "@/lib/data/settings";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hasGiftWrapping: boolean;
  giftMessage: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => { ok: boolean; reason?: string };
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  setGiftWrapping: (value: boolean) => void;
  setGiftMessage: (value: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasGiftWrapping: false,
      giftMessage: "",
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((line) => line.variantId === item.variantId);
        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (nextQty > item.stockQuantity) {
          return { ok: false, reason: "Brak wystarczającego stanu magazynowego." };
        }
        set({
          isOpen: true,
          items: existing
            ? get().items.map((line) =>
                line.variantId === item.variantId ? { ...line, quantity: nextQty } : line,
              )
            : [...get().items, { ...item, quantity }],
        });
        return { ok: true };
      },
      removeItem: (variantId) =>
        set({ items: get().items.filter((line) => line.variantId !== variantId) }),
      setQuantity: (variantId, quantity) =>
        set({
          items: get()
            .items.map((line) => {
              if (line.variantId !== variantId) return line;
              const next = Math.min(Math.max(quantity, 1), line.stockQuantity);
              return { ...line, quantity: next };
            })
            .filter((line) => line.quantity > 0),
        }),
      setGiftWrapping: (value) => set({ hasGiftWrapping: value, giftMessage: value ? get().giftMessage : "" }),
      setGiftMessage: (value) => set({ giftMessage: value }),
      clear: () => set({ items: [], hasGiftWrapping: false, giftMessage: "" }),
    }),
    { name: "trzywiatry-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPriceInCents * item.quantity, 0);
}

export function cartGiftWrapCost(hasGiftWrapping: boolean) {
  return hasGiftWrapping ? studioSettings.giftWrapPriceCents : 0;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
