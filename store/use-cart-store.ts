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

const CART_KEY = "trzywiatry-cart-v3";

/** Drop legacy keys that used to persist isOpen:true and trap the UI. */
function scrubLegacyCartStorage() {
  if (typeof window === "undefined") return;
  try {
    const legacyRaw = window.localStorage.getItem("trzywiatry-cart");
    const hasV3 = window.localStorage.getItem(CART_KEY);
    if (legacyRaw && !hasV3) {
      const parsed = JSON.parse(legacyRaw) as {
        state?: Partial<PersistedCart & { isOpen?: boolean }>;
      };
      const legacy = parsed.state ?? (parsed as Partial<PersistedCart>);
      window.localStorage.setItem(
        CART_KEY,
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

function readPersistedCart(): PersistedCart {
  if (typeof window === "undefined") {
    return { items: [], hasGiftWrapping: false, giftMessage: "" };
  }
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return { items: [], hasGiftWrapping: false, giftMessage: "" };
    const parsed = JSON.parse(raw) as { state?: Partial<PersistedCart> } & Partial<PersistedCart>;
    const saved = parsed.state ?? parsed;
    return {
      items: Array.isArray(saved.items) ? saved.items : [],
      hasGiftWrapping: Boolean(saved.hasGiftWrapping),
      giftMessage: typeof saved.giftMessage === "string" ? saved.giftMessage : "",
    };
  } catch {
    return { items: [], hasGiftWrapping: false, giftMessage: "" };
  }
}

/** Sync read of persisted lines — used to skip checkout chrome when the cart is empty. */
export function peekPersistedCartItems(): CartItem[] {
  return readPersistedCart().items;
}

let didSyncHydrate = false;

/**
 * Apply localStorage into the store synchronously (no async persist race).
 * Safe to call many times — runs once per page load.
 */
export function ensureCartHydratedSync() {
  if (typeof window === "undefined" || didSyncHydrate) return;
  didSyncHydrate = true;
  scrubLegacyCartStorage();
  const saved = readPersistedCart();
  useCartStore.setState({
    items: saved.items,
    hasGiftWrapping: saved.hasGiftWrapping,
    giftMessage: saved.giftMessage,
    isOpen: false,
  });
}

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
      name: CART_KEY,
      version: 1,
      // Next.js: we hydrate sync ourselves — avoid async persist race + long “Ładowanie…”.
      skipHydration: true,
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
    },
  ),
);

// Client bundle: fill cart before first React paint of cart UI.
if (typeof window !== "undefined") {
  ensureCartHydratedSync();
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPriceInCents * item.quantity, 0);
}

export function cartGiftWrapCost(
  hasGiftWrapping: boolean,
  giftWrapPriceCents = defaultStudioSettings.giftWrapPriceCents,
  giftWrapEnabled = true,
) {
  if (!giftWrapEnabled || !hasGiftWrapping) return 0;
  return giftWrapPriceCents;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
