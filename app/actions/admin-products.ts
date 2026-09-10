"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { mergeProductImages, saveProductImageUploads } from "@/lib/admin-product-images";
import { CATEGORIES_BY_DOMAIN } from "@/lib/constants";
import { getAllProducts, getProductById } from "@/lib/data/queries";
import { deleteRuntimeProduct, upsertRuntimeProduct } from "@/lib/data/runtime-store";
import type { Product, ProductDomain, ProductVariant } from "@/lib/types";

const domains = ["ceramika", "drewno", "formy", "warsztaty"] as const;

const variantDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Podaj nazwę wariantu"),
  sku: z.string().min(2, "Podaj SKU"),
  stockQuantity: z.coerce.number().int().min(0),
  priceZl: z.coerce.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  capacityMl: z.coerce.number().int().positive().optional(),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Podaj nazwę produktu"),
  slug: z.string().min(2, "Podaj slug"),
  description: z.string().min(10, "Opis min. 10 znaków"),
  domain: z.enum(domains),
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
    domain: formData.get("domain"),
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

function buildVariants(
  drafts: z.infer<typeof variantDraftSchema>[],
  existing?: ProductVariant[],
): ProductVariant[] | { error: string } {
  const skus = new Set<string>();
  const variants: ProductVariant[] = [];

  for (const draft of drafts) {
    const sku = draft.sku.toUpperCase();
    if (skus.has(sku)) {
      return { error: `SKU „${sku}” jest użyte więcej niż raz.` };
    }
    skus.add(sku);

    const previous = existing?.find((item) => item.id === draft.id);
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
      color: draft.color || previous?.color,
      colorHex: draft.colorHex || previous?.colorHex,
      capacityMl: draft.capacityMl ?? previous?.capacityMl,
      image: previous?.image,
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
    uploaded = await saveProductImageUploads(files, slug);
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
  const allowed = CATEGORIES_BY_DOMAIN[domain] ?? [];
  return allowed.includes(category);
}

function revalidateShop(slug: string) {
  revalidatePath("/sklep");
  revalidatePath(`/sklep/${slug}`);
  revalidatePath("/admin/produkty");
  revalidatePath("/", "layout");
}

export async function createProduct(formData: FormData) {
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

  const built = buildVariants(data.variants);
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
    domain: data.domain,
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
  revalidateShop(product.slug);
  redirect(`/admin/produkty/${product.id}?zapisano=1`);
}

export async function updateProduct(formData: FormData) {
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

  const built = buildVariants(data.variants, existing.variants);
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
    domain: data.domain,
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
  revalidateShop(product.slug);
  redirect(`/admin/produkty/${product.id}?zapisano=1`);
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const existing = getProductById(id);
  if (!existing) redirect("/admin/produkty?blad=1");

  deleteRuntimeProduct(id);
  revalidateShop(existing.slug);
  redirect("/admin/produkty?usunieto=1");
}

/** Quick stock update from the products list — qty + out-of-stock flag. */
export async function updateVariantStock(formData: FormData) {
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
  revalidateShop(existing.slug);
  return { ok: true as const, stockQuantity, outOfStock };
}

/** @deprecated use createProduct */
export async function createProductDraft(formData: FormData) {
  return createProduct(formData);
}
