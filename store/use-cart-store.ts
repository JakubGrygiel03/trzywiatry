"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultStudioSettings } from "@/lib/data/settings";
import type { CartItem } from "@/lib/types";

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

type PersistedCart = {
  items: CartItem[];
  hasGiftWrapping: boolean;
  giftMessage: string;
};

/** Drop legacy keys that used to persist isOpen:true and trap the UI. */
function scrubLegacyCartStorage() {
  if (typeof window === "undefined") return;
  try {
    const legacyRaw = window.localStorage.getItem("trzywiatry-cart");
    const hasV3 = window.localStorage.getItem("trzywiatry-cart-v3");
    if (legacyRaw && !hasV3) {
      const parsed = JSON.parse(legacyRaw) as {
        state?: Partial<PersistedCart & { isOpen?: boolean }>;
      };
      const legacy = parsed.state ?? (parsed as Partial<PersistedCart>);
      window.localStorage.setItem(
        "trzywiatry-cart-v3",
        JSON.stringify({
          state: {
            items: Array.isArray(legacy.items) ? legacy.items : [],
            hasGiftWrapping: Boolean(legacy.hasGiftWrapping),
            giftMessage: typeof legacy.giftMessage === "string" ? legacy.giftMessage : "",
          },
          version: 0,
        }),
      );
    }
    window.localStorage.removeItem("trzywiatry-cart");
  } catch {
    /* ignore quota / private mode */
  }
}

scrubLegacyCartStorage();

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
      clear: () => set({ items: [], hasGiftWrapping: false, giftMessage: "", isOpen: false }),
    }),
    {
      // New key: old “trzywiatry-cart” could reopen the drawer forever via isOpen.
      name: "trzywiatry-cart-v3",
      version: 1,
      partialize: (state): PersistedCart => ({
        items: state.items,
        hasGiftWrapping: state.hasGiftWrapping,
        giftMessage: state.giftMessage,
      }),
      migrate: (persisted) => {
        const raw = (persisted ?? {}) as Partial<PersistedCart & { isOpen?: boolean; state?: PersistedCart }>;
        const saved = raw.state ?? raw;
        return {
          items: Array.isArray(saved.items) ? saved.items : [],
          hasGiftWrapping: Boolean(saved.hasGiftWrapping),
          giftMessage: typeof saved.giftMessage === "string" ? saved.giftMessage : "",
        } satisfies PersistedCart;
      },
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PersistedCart>;
        return {
          ...current,
          items: Array.isArray(saved.items) ? saved.items : current.items,
          hasGiftWrapping: typeof saved.hasGiftWrapping === "boolean" ? saved.hasGiftWrapping : current.hasGiftWrapping,
          giftMessage: typeof saved.giftMessage === "string" ? saved.giftMessage : current.giftMessage,
          isOpen: false,
        };
      },
      onRehydrateStorage: () => () => {
        useCartStore.setState({ isOpen: false });
      },
    },
  ),
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPriceInCents * item.quantity, 0);
}

export function cartGiftWrapCost(
  hasGiftWrapping: boolean,
  giftWrapPriceCents = defaultStudioSettings.giftWrapPriceCents,
) {
  return hasGiftWrapping ? giftWrapPriceCents : 0;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
