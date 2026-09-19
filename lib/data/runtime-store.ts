import type { ContentOverlayMap } from "@/lib/cms/content-pages";
import type { HomeSection } from "@/lib/cms/home-layout";
import { collections as seedCollections } from "@/lib/data/collections";
import { blogPosts as seedBlogPosts } from "@/lib/data/posts";
import { products as seedProducts } from "@/lib/data/products";
import { defaultStudioSettings } from "@/lib/data/settings";
import { workshops as seedWorkshops } from "@/lib/data/workshops";
import type { BlogPost, Collection, OrderStatus, Product, StoredOrder, StudioSettings, Workshop } from "@/lib/types";

let persistRuntime: (() => void) | null = null;

/** Server persist module registers a disk writer; the browser keeps a no-op. */
export function setAtelierPersister(fn: () => void) {
  persistRuntime = fn;
}

function persist() {
  persistRuntime?.();
}

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
  /** Admin overrides for transactional email copy. */
  emailTemplates: Record<string, { subject: string; body: string }>;
  /** Homepage section order + copy (Supabase page_layouts, memory fallback). */
  homeLayout?: HomeSection[];
  /** Overlay copy for B2B / O nas / Kontakt (same page_layouts table). */
  contentPages?: Partial<ContentOverlayMap>;
  collections?: Collection[];
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
    emailTemplates: {},
    homeLayout: undefined,
    contentPages: {},
    collections: structuredClone(seedCollections),
  };
}

export const runtimeStore = globalStore.__twStore ?? (globalStore.__twStore = createStore());

if (!runtimeStore.settings) {
  runtimeStore.settings = { ...defaultStudioSettings };
}

if (!runtimeStore.emailTemplates) {
  runtimeStore.emailTemplates = {};
}

if (!runtimeStore.contentPages) {
  runtimeStore.contentPages = {};
}

// Old seed baked the campaign into the sentence — tokens + chip follow the admin field.
const announcement = runtimeStore.settings.announcementText ?? "";
if (announcement.includes("WIOSNA") || announcement.includes("hasło {code}") || announcement.includes("{code}")) {
  runtimeStore.settings.announcementText = defaultStudioSettings.announcementText;
}

// Promo code must stay email-only — scrub legacy storefront copy that leaked {code}/WIOSNA.
const newsletterBody = runtimeStore.settings.newsletterBody ?? "";
if (newsletterBody.includes("{code}") || newsletterBody.includes("WIOSNA")) {
  runtimeStore.settings.newsletterBody = defaultStudioSettings.newsletterBody;
}
if (Array.isArray(runtimeStore.homeLayout)) {
  runtimeStore.homeLayout = runtimeStore.homeLayout.map((section) => {
    if (section.type !== "newsletter") return section;
    const body = section.payload.body ?? "";
    if (!body.includes("{code}") && !body.includes("WIOSNA")) return section;
    return {
      ...section,
      payload: { ...section.payload, body: defaultStudioSettings.newsletterBody },
    };
  });
}

if (!Array.isArray(runtimeStore.orders)) {
  runtimeStore.orders = [];
}

if (!Array.isArray(runtimeStore.catalog) || runtimeStore.catalog.length === 0) {
  runtimeStore.catalog = structuredClone(seedProducts);
} else {
  // Drop leftover split SKUs and the duplicate form listing
  const drop = new Set([
    "p-wygodny-kubas-miodowy",
    "p-wygodny-kubas-zolty",
    "p-wygodny-kubas-lawendowy",
    "p-formy-nieokielznane",
  ]);
  runtimeStore.catalog = runtimeStore.catalog.filter((item) => !drop.has(item.id));
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

  const seedById = new Map(seedBlogPosts.map((item) => [item.id, item]));
  for (const post of runtimeStore.blogPosts) {
    if (post.coverBackdrop) continue;
    const seed = seedById.get(post.id);
    if (seed?.coverBackdrop) post.coverBackdrop = seed.coverBackdrop;
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
  persist();
  return post;
}

export function deleteRuntimeBlogPost(id: string) {
  const posts = getRuntimeBlogPosts();
  const index = posts.findIndex((item) => item.id === id);
  if (index < 0) return false;
  posts.splice(index, 1);
  persist();
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
  persist();
  return workshop;
}

export function deleteRuntimeWorkshop(id: string) {
  const list = getRuntimeWorkshops();
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return false;
  list.splice(index, 1);
  persist();
  return true;
}

export function getRuntimeWorkshopById(id: string) {
  return getRuntimeWorkshops().find((workshop) => workshop.id === id);
}

export function nextOrderNumber() {
  let max = 0;
  for (const order of runtimeStore.orders) {
    const match = /^TW-(\d+)$/.exec(order.orderNumber);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `TW-${String(max + 1).padStart(4, "0")}`;
}

export function getRuntimeSettings(): StudioSettings {
  return { ...defaultStudioSettings, ...(runtimeStore.settings ?? {}) };
}

export function updateRuntimeSettings(patch: Partial<StudioSettings>) {
  runtimeStore.settings = { ...getRuntimeSettings(), ...patch };
  persist();
  return runtimeStore.settings;
}

export function getRuntimeCollections(): Collection[] {
  if (!Array.isArray(runtimeStore.collections) || runtimeStore.collections.length === 0) {
    runtimeStore.collections = structuredClone(seedCollections);
  }
  return runtimeStore.collections;
}

export function upsertCollectionsFromGlaze(
  lines: { id: string; name: string; slug: string; description: string }[],
) {
  const list = getRuntimeCollections();
  for (const line of lines) {
    const index = list.findIndex((item) => item.id === line.id || item.slug === line.slug);
    const imageUrl = list[index]?.imageUrl ?? "/brand/photos/ceramic-mugs.jpg";
    const next: Collection = {
      id: line.id,
      name: line.name,
      slug: line.slug,
      description: line.description,
      imageUrl,
    };
    if (index >= 0) list[index] = next;
    else list.push(next);
  }
  persist();
}

const DROP_PRODUCT_IDS = new Set([
  "p-wygodny-kubas-miodowy",
  "p-wygodny-kubas-zolty",
  "p-wygodny-kubas-lawendowy",
  "p-formy-nieokielznane",
]);

let lastSeedIdSignature = "";

function seedIdSignature() {
  return seedProducts
    .map((product) => `${product.id}:${product.slug}:${product.variants.length}:${product.images[0] ?? ""}`)
    .join("|");
}

export function getCatalogSeedSignature() {
  return lastSeedIdSignature;
}

export function setCatalogSeedSignature(signature: string) {
  lastSeedIdSignature = signature;
}

/**
 * Keep admin edits. Only append products that appeared in the seed file
 * after the last persisted signature — never replace the whole catalog.
 */
function mergeNewSeedProducts() {
  const signature = seedIdSignature();
  if (!Array.isArray(runtimeStore.catalog) || runtimeStore.catalog.length === 0) {
    runtimeStore.catalog = structuredClone(seedProducts);
    lastSeedIdSignature = signature;
    return;
  }

  runtimeStore.catalog = runtimeStore.catalog.filter((product) => !DROP_PRODUCT_IDS.has(product.id));
  if (signature === lastSeedIdSignature) return;

  const ids = new Set(runtimeStore.catalog.map((product) => product.id));
  for (const seed of seedProducts) {
    if (!ids.has(seed.id) && !DROP_PRODUCT_IDS.has(seed.id)) {
      runtimeStore.catalog.push(structuredClone(seed));
      ids.add(seed.id);
    }
  }
  lastSeedIdSignature = signature;
}

export function getRuntimeCatalog(): Product[] {
  mergeNewSeedProducts();
  return runtimeStore.catalog;
}

export function upsertRuntimeProduct(product: Product) {
  const catalog = getRuntimeCatalog();
  const index = catalog.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    catalog[index] = product;
  } else {
    catalog.unshift(product);
  }
  persist();
  return product;
}

export function deleteRuntimeProduct(id: string) {
  const catalog = getRuntimeCatalog();
  const index = catalog.findIndex((item) => item.id === id);
  if (index < 0) return false;
  catalog.splice(index, 1);
  persist();
  return true;
}

export function applyVariantStockDelta(
  lines: { variantId: string; quantity: number }[],
  sign: 1 | -1,
) {
  const catalog = getRuntimeCatalog();
  for (const line of lines) {
    for (const product of catalog) {
      const variant = product.variants.find((item) => item.id === line.variantId);
      if (!variant) continue;
      variant.stockQuantity = Math.max(0, variant.stockQuantity + sign * line.quantity);
      variant.isAvailable = variant.stockQuantity > 0;
    }
  }
  persist();
}

export function getOrderById(id: string) {
  return runtimeStore.orders.find((order) => order.id === id);
}

export function getOrderByNumber(orderNumber: string) {
  return runtimeStore.orders.find((order) => order.orderNumber === orderNumber);
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

  if (status === "cancelled" && current.status !== "cancelled") {
    applyVariantStockDelta(
      current.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      1,
    );
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
