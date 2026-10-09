"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { mergeProductImages, saveProductImageUploads } from "@/lib/admin-product-images";
import { getAllProducts, getProductById, getProductCategories } from "@/lib/data/queries";
import { deleteRuntimeProduct, upsertRuntimeProduct } from "@/lib/data/runtime-store";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { assertAdminSession } from "@/lib/admin-guard";
import { laneForDomain, type ShopLaneId } from "@/lib/shop-lanes";
import { recordSlugRedirect } from "@/lib/slug-redirects";
import { suggestVariantSku, uniqueSku } from "@/lib/sku";
import { withCmsTick } from "@/lib/cms-redirect";
import type { Product, ProductDomain, ProductVariant } from "@/lib/types";

const domains = ["ceramika", "drewno", "formy", "warsztaty"] as const;

const variantDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Podaj nazwę wariantu"),
  sku: z.string().trim().max(32).optional(),
  stockQuantity: z.coerce.number().int().min(0),
  priceZl: z.coerce.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  capacityMl: z.coerce.number().int().positive().optional(),
  image: z.string().optional(),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Podaj nazwę produktu").max(80, "Nazwa: max 80 znaków.").refine((v) => !/[<>]/.test(v), "Nazwa bez HTML."),
  slug: z.string().trim().min(2, "Podaj slug").max(80).regex(/^[a-z0-9-]+$/, "Slug: małe litery, cyfry i myślnik."),
  description: z.string().trim().min(10, "Opis min. 10 znaków").max(4000, "Opis jest za długi."),
  shortDescription: z.string().trim().max(220, "Krótki opis: max 220 znaków.").optional(),
  domain: z.enum(domains),
  shopLane: z.enum(["uzytkowa", "pracownia"]),
  category: z.string().min(1),
  subCategory: z.string().optional(),
  capacityMl: z.number().int().positive().optional(),
  collectionId: z.string().optional(),
  priceZl: z.coerce.number().positive("Cena musi być > 0"),
  careInstructions: z.string().optional(),
  lowStockThreshold: z.coerce.number().int().min(0).default(2),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean(),
  isBestseller: z.boolean(),
  variants: z.array(variantDraftSchema).min(1, "Dodaj co najmniej jeden wariant"),
  relatedIds: z.array(z.string()).max(6).optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseVariants(formData: FormData) {
  const raw = String(formData.get("variantsJson") ?? "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Legacy single-variant fields (older forms / fallback)
  return [
    {
      title: String(formData.get("variantTitle") ?? ""),
      sku: String(formData.get("sku") ?? ""),
      stockQuantity: Number(formData.get("stockQuantity") ?? 0),
      isAvailable: true,
    },
  ];
}

function parseForm(formData: FormData) {
  const capacityRaw = String(formData.get("capacityMl") ?? "").trim();
  const collectionRaw = String(formData.get("collectionId") ?? "").trim();
  const capacityParsed = capacityRaw ? Number(capacityRaw) : undefined;

  return productSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    name: formData.get("name"),
    slug: String(formData.get("slug") ?? "").trim() || slugify(String(formData.get("name") ?? "")),
    description: formData.get("description"),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    domain: formData.get("domain"),
    shopLane: String(formData.get("shopLane") ?? "").trim() || laneForDomain(String(formData.get("domain") ?? "ceramika") as ProductDomain),
    category: formData.get("category"),
    subCategory: String(formData.get("subCategory") ?? "").trim() || undefined,
    capacityMl:
      capacityParsed !== undefined && Number.isFinite(capacityParsed) && capacityParsed > 0
        ? capacityParsed
        : undefined,
    collectionId: collectionRaw || undefined,
    priceZl: formData.get("priceZl"),
    careInstructions: String(formData.get("careInstructions") ?? "").trim() || undefined,
    lowStockThreshold: formData.get("lowStockThreshold") || 2,
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || undefined,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || undefined,
    isPublished: formData.get("isPublished") === "true",
    isBestseller: formData.get("isBestseller") === "true",
    variants: parseVariants(formData),
    relatedIds: parseRelatedIds(formData),
  });
}

function parseRelatedIds(formData: FormData) {
  const raw = String(formData.get("relatedIdsJson") ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function usedSkus(exceptProductId?: string) {
  const used = new Set<string>();
  for (const product of getAllProducts()) {
    if (exceptProductId && product.id === exceptProductId) continue;
    for (const variant of product.variants) {
      const sku = variant.sku?.trim().toUpperCase();
      if (sku) used.add(sku);
    }
  }
  return used;
}

function resolveVariantSku(
  draft: z.infer<typeof variantDraftSchema>,
  slug: string,
  used: Set<string>,
) {
  const manual = (draft.sku ?? "").trim().toUpperCase();
  const candidate = manual.length >= 2 ? manual : suggestVariantSku(slug, draft.title);
  const sku = uniqueSku(candidate, used);
  used.add(sku);
  return sku;
}

function buildVariants(
  drafts: z.infer<typeof variantDraftSchema>[],
  options: { slug: string; existing?: ProductVariant[]; exceptProductId?: string },
): ProductVariant[] | { error: string } {
  const used = usedSkus(options.exceptProductId);
  const variants: ProductVariant[] = [];

  for (const draft of drafts) {
    const sku = resolveVariantSku(draft, options.slug, used);

    const previous = options.existing?.find((item) => item.id === draft.id);
    const stockQuantity = draft.stockQuantity;
    variants.push({
      id: previous?.id ?? draft.id ?? `v-${crypto.randomUUID().slice(0, 8)}`,
      sku,
      title: draft.title,
      stockQuantity,
      isAvailable: draft.isAvailable ?? stockQuantity > 0,
      priceInCents:
        draft.priceZl != null && Number.isFinite(draft.priceZl)
          ? Math.round(draft.priceZl * 100)
          : undefined,
      // Form payload is source of truth — empty clears previous colour / capacity / image
      color: draft.color?.trim() || undefined,
      colorHex: draft.colorHex?.trim() || undefined,
      capacityMl: draft.capacityMl,
      image: draft.image?.trim() || undefined,
    });
  }

  return variants;
}

function getImageFiles(formData: FormData) {
  return formData
    .getAll("imageFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function getExistingImageUrls(formData: FormData) {
  return formData.getAll("imageUrls").map(String).filter(Boolean);
}

async function resolveProductImages(formData: FormData, slug: string) {
  const existingUrls = getExistingImageUrls(formData);
  const files = getImageFiles(formData);

  let uploaded: string[] = [];
  try {
    if (files.length > 0) {
      uploaded = await saveProductImageUploads(files, slug);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nie udało się zapisać zdjęć.";
    throw new Error(message);
  }

  const images = mergeProductImages(existingUrls, uploaded);
  if (images.length === 0) {
    throw new Error("Dodaj co najmniej jedno zdjęcie produktu.");
  }

  return images;
}

function assertCategory(domain: ProductDomain, category: string) {
  return getProductCategories().some((row) => row.domain === domain && row.id === category);
}

function revalidateShop(slug: string, productId?: string) {
  revalidatePath("/sklep");
  revalidatePath("/sklep", "layout");
  revalidatePath(`/sklep/${slug}`);
  revalidatePath("/admin/produkty");
  revalidatePath("/admin/produkty", "layout");
  if (productId) revalidatePath(`/admin/produkty/${productId}`);
  revalidatePath("/", "layout");
}

function resolveShopLane(domain: ProductDomain, shopLane: ShopLaneId): ShopLaneId {
  return shopLane === "uzytkowa" || shopLane === "pracownia" ? shopLane : laneForDomain(domain);
}

export async function createProduct(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const parsed = parseForm(formData);
  if (!parsed.success) {
    redirect(`/admin/produkty/nowy?blad=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Błąd")}`);
  }

  const data = parsed.data;
  if (!assertCategory(data.domain, data.category)) {
    redirect("/admin/produkty/nowy?blad=" + encodeURIComponent("Kategoria nie pasuje do domeny."));
  }

  const slugTaken = getAllProducts().some((product) => product.slug === data.slug);
  if (slugTaken) {
    redirect("/admin/produkty/nowy?blad=" + encodeURIComponent("Slug jest już zajęty."));
  }

  const built = buildVariants(data.variants, { slug: data.slug });
  if ("error" in built) {
    redirect(`/admin/produkty/nowy?blad=${encodeURIComponent(built.error)}`);
  }

  let images: string[];
  try {
    images = await resolveProductImages(formData, data.slug);
  } catch (error) {
    redirect(
      `/admin/produkty/nowy?blad=${encodeURIComponent(error instanceof Error ? error.message : "Błąd zdjęć")}`,
    );
  }

  const product: Product = {
    id: `p-${crypto.randomUUID().slice(0, 10)}`,
    name: data.name,
    slug: data.slug,
    description: data.description,
    shortDescription: data.shortDescription,
    domain: data.domain,
    shopLane: resolveShopLane(data.domain, data.shopLane),
    category: data.category,
    subCategory: data.subCategory,
    capacityMl: Number.isFinite(data.capacityMl as number) ? data.capacityMl : undefined,
    collectionId: data.collectionId,
    priceInCents: Math.round(data.priceZl * 100),
    isPublished: data.isPublished,
    isBestseller: data.isBestseller,
    images,
    careInstructions: data.careInstructions,
    lowStockThreshold: data.lowStockThreshold,
    metaTitle: data.metaTitle ?? data.name,
    metaDescription: data.metaDescription ?? data.description.slice(0, 160),
    variants: built,
    relatedIds: data.relatedIds,
  };

  upsertRuntimeProduct(product);
  await flushAtelierSave();
  revalidateShop(product.slug, product.id);
  redirect(withCmsTick(`/admin/produkty/${product.id}?zapisano=1`));
}

export async function updateProduct(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const parsed = parseForm(formData);
  if (!parsed.success || !parsed.data.id) {
    redirect("/admin/produkty?blad=1");
  }

  const data = parsed.data;
  const existing = getProductById(data.id!);
  if (!existing) redirect("/admin/produkty?blad=1");

  if (!assertCategory(data.domain, data.category)) {
    redirect(`/admin/produkty/${existing.id}?blad=` + encodeURIComponent("Kategoria nie pasuje do domeny."));
  }

  const slugTaken = getAllProducts().some(
    (product) => product.slug === data.slug && product.id !== existing.id,
  );
  if (slugTaken) {
    redirect(`/admin/produkty/${existing.id}?blad=` + encodeURIComponent("Slug jest już zajęty."));
  }

  const built = buildVariants(data.variants, {
    slug: data.slug,
    existing: existing.variants,
    exceptProductId: existing.id,
  });
  if ("error" in built) {
    redirect(`/admin/produkty/${existing.id}?blad=${encodeURIComponent(built.error)}`);
  }

  let images: string[];
  try {
    images = await resolveProductImages(formData, data.slug);
  } catch (error) {
    redirect(
      `/admin/produkty/${existing.id}?blad=${encodeURIComponent(error instanceof Error ? error.message : "Błąd zdjęć")}`,
    );
  }

  const product: Product = {
    ...existing,
    name: data.name,
    slug: data.slug,
    description: data.description,
    shortDescription: data.shortDescription,
    domain: data.domain,
    shopLane: resolveShopLane(data.domain, data.shopLane),
    category: data.category,
    subCategory: data.subCategory,
    capacityMl: Number.isFinite(data.capacityMl as number) ? data.capacityMl : undefined,
    collectionId: data.collectionId,
    priceInCents: Math.round(data.priceZl * 100),
    isPublished: data.isPublished,
    isBestseller: data.isBestseller,
    images,
    careInstructions: data.careInstructions,
    lowStockThreshold: data.lowStockThreshold,
    metaTitle: data.metaTitle ?? data.name,
    metaDescription: data.metaDescription ?? data.description.slice(0, 160),
    variants: built,
    relatedIds: data.relatedIds,
  };

  upsertRuntimeProduct(product);
  if (existing.slug !== product.slug) {
    recordSlugRedirect("product", existing.slug, product.slug);
  }
  await flushAtelierSave();
  revalidateShop(product.slug, product.id);
  if (existing.slug !== product.slug) {
    revalidatePath(`/sklep/${existing.slug}`);
  }
  redirect(withCmsTick(`/admin/produkty/${product.id}?zapisano=1`));
}

export async function duplicateProduct(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const id = String(formData.get("id") ?? "").trim();
  const source = getProductById(id);
  if (!source) redirect("/admin/produkty?blad=1");

  const catalog = getAllProducts();
  let slug = `${source.slug}-kopia`;
  let n = 2;
  while (catalog.some((row) => row.slug === slug)) {
    slug = `${source.slug}-kopia-${n}`;
    n += 1;
  }
  const used = new Set(catalog.flatMap((row) => row.variants.map((variant) => variant.sku)));
  const copy: Product = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} (kopia)`,
    slug,
    isPublished: false,
    variants: source.variants.map((variant) => {
      const sku = uniqueSku(`${variant.sku}-K`, used);
      used.add(sku);
      return { ...variant, id: `v-${crypto.randomUUID().slice(0, 8)}`, sku };
    }),
  };
  upsertRuntimeProduct(copy);
  await flushAtelierSave();
  revalidateShop(copy.slug, copy.id);
  redirect(withCmsTick(`/admin/produkty/${copy.id}?zapisano=1`));
}

export async function deleteProduct(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const id = String(formData.get("id") ?? "").trim();
  const existing = getProductById(id);
  if (!existing) redirect("/admin/produkty?blad=1");

  deleteRuntimeProduct(id);
  await flushAtelierSave();
  revalidateShop(existing.slug, existing.id);
  redirect(`/admin/produkty?usunieto=1&t=${Date.now()}`);
}

/** Quick stock update from the products list — qty + out-of-stock flag. */
export async function updateVariantStock(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const productId = String(formData.get("productId") ?? "").trim();
  const variantId = String(formData.get("variantId") ?? "").trim();
  const outOfStock = formData.get("outOfStock") === "true";
  const stockRaw = Number(formData.get("stockQuantity") ?? 0);
  const stockQuantity = outOfStock ? 0 : Math.max(0, Number.isFinite(stockRaw) ? Math.trunc(stockRaw) : 0);

  const existing = getProductById(productId);
  if (!existing) return { ok: false as const };

  const variants = existing.variants.map((variant) =>
    variant.id === variantId
      ? {
          ...variant,
          stockQuantity,
          isAvailable: !outOfStock && stockQuantity > 0,
        }
      : variant,
  );

  if (!variants.some((variant) => variant.id === variantId)) {
    return { ok: false as const };
  }

  upsertRuntimeProduct({ ...existing, variants });
  await flushAtelierSave();
  revalidateShop(existing.slug, existing.id);
  return { ok: true as const, stockQuantity, outOfStock };
}

/** Quick bestseller flag from the products list. */
export async function updateProductBestseller(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const productId = String(formData.get("productId") ?? "").trim();
  const isBestseller = formData.get("isBestseller") === "true";
  const existing = getProductById(productId);
  if (!existing) return { ok: false as const };

  upsertRuntimeProduct({ ...existing, isBestseller });
  await flushAtelierSave();
  revalidateShop(existing.slug, existing.id);
  return { ok: true as const, isBestseller };
}

/** @deprecated use createProduct */
export async function createProductDraft(formData: FormData) {
  return createProduct(formData);
}

export async function bulkUpdateProducts(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const ids = formData.getAll("ids").map((value) => String(value).trim()).filter(Boolean);
  const category = String(formData.get("category") ?? "").trim();
  const publishRaw = String(formData.get("publish") ?? "");
  const back = new URLSearchParams();
  const q = String(formData.get("q") ?? "").trim();
  const kategoria = String(formData.get("kategoria") ?? "").trim();
  if (q) back.set("q", q);
  if (kategoria) back.set("kategoria", kategoria);

  function fail(message: string): never {
    back.set("blad", message);
    redirect(withCmsTick(`/admin/produkty?${back}`));
  }

  if (ids.length === 0) fail("Zaznacz przynajmniej jeden produkt.");
  if (!category && publishRaw !== "1" && publishRaw !== "0") {
    fail("Wybierz kategorię albo status publikacji.");
  }

  const defs = getProductCategories();
  const catDef = category ? defs.find((row) => row.id === category) : undefined;
  if (category && !catDef) fail("Nieznana kategoria.");

  for (const id of ids) {
    const existing = getProductById(id);
    if (!existing) continue;
    const next: Product = { ...existing };
    if (catDef) {
      next.category = catDef.id;
      next.domain = catDef.domain;
      next.shopLane = laneForDomain(catDef.domain);
    }
    if (publishRaw === "1") next.isPublished = true;
    if (publishRaw === "0") next.isPublished = false;
    upsertRuntimeProduct(next);
    revalidateShop(next.slug, next.id);
  }

  await flushAtelierSave();
  back.set("masowo", String(ids.length));
  redirect(withCmsTick(`/admin/produkty?${back}`));
}
