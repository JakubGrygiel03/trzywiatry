import type { BlogPost, OrderStatus, Product, StoredOrder, StudioSettings, Workshop } from "@/lib/types";
import { blogPosts as seedBlogPosts } from "@/lib/data/posts";
import { products as seedProducts } from "@/lib/data/products";
import { defaultStudioSettings } from "@/lib/data/settings";
import { workshops as seedWorkshops } from "@/lib/data/workshops";
import { getProductPhoto } from "@/lib/media";

type Inquiry = {
  id: string;
  createdAt: string;
  payload: Record<string, string | number>;
};

type RuntimeStore = {
  orders: StoredOrder[];
  bookings: Inquiry[];
  newsletter: string[];
  b2b: Inquiry[];
  contacts: Inquiry[];
  settings: StudioSettings;
  /** Mutable shop catalog (seeded from mock products until Supabase). */
  catalog: Product[];
  /** Mutable blog posts until Supabase CMS. */
  blogPosts: BlogPost[];
  /** Mutable workshop schedule until Supabase. */
  workshops: Workshop[];
};

const globalStore = globalThis as typeof globalThis & { __twStore?: RuntimeStore };

function createStore(): RuntimeStore {
  return {
    orders: [],
    bookings: [],
    newsletter: [],
    b2b: [],
    contacts: [],
    settings: { ...defaultStudioSettings },
    catalog: structuredClone(seedProducts),
    blogPosts: structuredClone(seedBlogPosts),
    workshops: structuredClone(seedWorkshops),
  };
}

export const runtimeStore = globalStore.__twStore ?? (globalStore.__twStore = createStore());

if (!runtimeStore.settings) {
  runtimeStore.settings = { ...defaultStudioSettings };
}

if (!Array.isArray(runtimeStore.orders)) {
  runtimeStore.orders = [];
}

if (!Array.isArray(runtimeStore.catalog) || runtimeStore.catalog.length === 0) {
  runtimeStore.catalog = structuredClone(seedProducts);
}

if (!Array.isArray(runtimeStore.blogPosts) || runtimeStore.blogPosts.length === 0) {
  runtimeStore.blogPosts = structuredClone(seedBlogPosts);
}

if (!Array.isArray(runtimeStore.workshops) || runtimeStore.workshops.length === 0) {
  runtimeStore.workshops = structuredClone(seedWorkshops);
}

let lastMergedBlogSeedCount = 0;
let lastMergedWorkshopSeedCount = 0;

export function getRuntimeBlogPosts(): BlogPost[] {
  if (!Array.isArray(runtimeStore.blogPosts) || runtimeStore.blogPosts.length === 0) {
    runtimeStore.blogPosts = structuredClone(seedBlogPosts);
    lastMergedBlogSeedCount = seedBlogPosts.length;
    return runtimeStore.blogPosts;
  }

  if (seedBlogPosts.length !== lastMergedBlogSeedCount) {
    const ids = new Set(runtimeStore.blogPosts.map((item) => item.id));
    for (const seed of seedBlogPosts) {
      if (!ids.has(seed.id)) {
        runtimeStore.blogPosts.push(structuredClone(seed));
        ids.add(seed.id);
      }
    }
    lastMergedBlogSeedCount = seedBlogPosts.length;
  }

  return runtimeStore.blogPosts;
}

export function upsertRuntimeBlogPost(post: BlogPost) {
  const posts = getRuntimeBlogPosts();
  const index = posts.findIndex((item) => item.id === post.id);
  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.unshift(post);
  }
  return post;
}

export function deleteRuntimeBlogPost(id: string) {
  const posts = getRuntimeBlogPosts();
  const index = posts.findIndex((item) => item.id === id);
  if (index < 0) return false;
  posts.splice(index, 1);
  return true;
}

export function getBlogPostById(id: string) {
  return getRuntimeBlogPosts().find((post) => post.id === id);
}

export function getRuntimeWorkshops(): Workshop[] {
  if (!Array.isArray(runtimeStore.workshops) || runtimeStore.workshops.length === 0) {
    runtimeStore.workshops = structuredClone(seedWorkshops);
    lastMergedWorkshopSeedCount = seedWorkshops.length;
    return runtimeStore.workshops;
  }

  if (seedWorkshops.length !== lastMergedWorkshopSeedCount) {
    const ids = new Set(runtimeStore.workshops.map((item) => item.id));
    for (const seed of seedWorkshops) {
      if (!ids.has(seed.id)) {
        runtimeStore.workshops.push(structuredClone(seed));
        ids.add(seed.id);
      }
    }
    lastMergedWorkshopSeedCount = seedWorkshops.length;
  }

  return runtimeStore.workshops;
}

export function upsertRuntimeWorkshop(workshop: Workshop) {
  const list = getRuntimeWorkshops();
  const index = list.findIndex((item) => item.id === workshop.id);
  if (index >= 0) {
    list[index] = workshop;
  } else {
    list.unshift(workshop);
  }
  return workshop;
}

export function deleteRuntimeWorkshop(id: string) {
  const list = getRuntimeWorkshops();
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return false;
  list.splice(index, 1);
  return true;
}

export function getRuntimeWorkshopById(id: string) {
  return getRuntimeWorkshops().find((workshop) => workshop.id === id);
}

export function nextOrderNumber() {
  const n = runtimeStore.orders.length + 1;
  return `TW-${String(n).padStart(4, "0")}`;
}

export function getRuntimeSettings(): StudioSettings {
  return { ...defaultStudioSettings, ...(runtimeStore.settings ?? {}) };
}

export function updateRuntimeSettings(patch: Partial<StudioSettings>) {
  runtimeStore.settings = { ...getRuntimeSettings(), ...patch };
  return runtimeStore.settings;
}

let lastSeedIdSignature = "";

function seedIdSignature() {
  return seedProducts.map((product) => product.id).join("|");
}

/**
 * Sync catalog with seed products:
 * - replace seed entries with current seed file
 * - drop products removed from seed (old demo / illustration SKUs)
 * - keep admin-created products (ids never in the seed set)
 */
function syncCatalogWithSeed() {
  const signature = seedIdSignature();
  const seedIds = new Set(seedProducts.map((product) => product.id));
  const previousSeedIds = new Set(lastSeedIdSignature ? lastSeedIdSignature.split("|") : []);

  const customProducts = (runtimeStore.catalog ?? []).filter((product) => {
    if (seedIds.has(product.id)) return false;
    if (previousSeedIds.has(product.id)) return false;
    // After long-lived HMR, unknown leftovers without real photos are old demos
    if (!lastSeedIdSignature) return Boolean(getProductPhoto(product));
    return true;
  });

  runtimeStore.catalog = [...structuredClone(seedProducts), ...customProducts];
  lastSeedIdSignature = signature;
}

export function getRuntimeCatalog(): Product[] {
  if (!Array.isArray(runtimeStore.catalog) || runtimeStore.catalog.length === 0) {
    syncCatalogWithSeed();
    return runtimeStore.catalog;
  }

  if (seedIdSignature() !== lastSeedIdSignature) {
    syncCatalogWithSeed();
  }

  return runtimeStore.catalog;
}

/** One-shot prune of demo SKUs left in the HMR-global store. */
syncCatalogWithSeed();

export function upsertRuntimeProduct(product: Product) {
  const catalog = getRuntimeCatalog();
  const index = catalog.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    catalog[index] = product;
  } else {
    catalog.unshift(product);
  }
  return product;
}

export function deleteRuntimeProduct(id: string) {
  const catalog = getRuntimeCatalog();
  const index = catalog.findIndex((item) => item.id === id);
  if (index < 0) return false;
  catalog.splice(index, 1);
  return true;
}

export function getOrderById(id: string) {
  return runtimeStore.orders.find((order) => order.id === id);
}

export function addRuntimeOrder(order: StoredOrder) {
  runtimeStore.orders.unshift(order);
  return order;
}

export function updateOrderStatusInStore(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
): StoredOrder | null {
  const index = runtimeStore.orders.findIndex((order) => order.id === id);
  if (index < 0) return null;

  const current = runtimeStore.orders[index]!;
  const now = new Date().toISOString();
  const history = [...(current.statusHistory ?? [{ status: current.status, at: current.createdAt }])];
  if (current.status !== status) {
    history.push({ status, at: now });
  }

  const next: StoredOrder = {
    ...current,
    status,
    statusHistory: history,
    trackingNumber: trackingNumber?.trim() || current.trackingNumber,
    updatedAt: now,
    payload: {
      ...current.payload,
      status,
      trackingNumber: trackingNumber?.trim() || current.trackingNumber || "",
    },
  };
  runtimeStore.orders[index] = next;
  return next;
}
