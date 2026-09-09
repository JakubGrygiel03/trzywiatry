"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecentlyViewedItem = {
  id: string;
  slug: string;
  name: string;
  priceInCents: number;
  image: string;
  viewedAt: number;
};

const MAX_ITEMS = 8;

type RecentlyViewedState = {
  items: RecentlyViewedItem[];
  track: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      track: (item) => {
        const rest = get().items.filter((entry) => entry.id !== item.id);
        set({
          items: [{ ...item, viewedAt: Date.now() }, ...rest].slice(0, MAX_ITEMS),
        });
      },
    }),
    { name: "tw-recently-viewed" },
  ),
);
