"use client";

import { useMemo, useState } from "react";
import { ProductImagesField } from "@/components/admin/product-images-field";
import { ProductVariantsField } from "@/components/admin/product-variants-field";
import { RelatedProductsField } from "@/components/admin/related-products-field";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { DOMAIN_LABELS } from "@/lib/constants";
import { categoriesForDomain, type ProductCategoryDef } from "@/lib/product-categories";
import { laneForDomain, SHOP_LANES, type ShopLaneId } from "@/lib/shop-lanes";
import type { Collection, Product, ProductDomain } from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function firstCategoryId(list: ProductCategoryDef[], domain: ProductDomain, preferred?: string) {
  const cats = categoriesForDomain(list, domain);
  if (preferred && cats.some((row) => row.id === preferred)) return preferred;
  return cats[0]?.id ?? "";
}

export function ProductForm({
  action,
  product,
  collections,
  catalog = [],
  categoryOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  collections: Collection[];
  catalog?: { id: string; name: string }[];
  categoryOptions: ProductCategoryDef[];
  submitLabel: string;
}) {
  const [domain, setDomain] = useState<ProductDomain>(product?.domain ?? "ceramika");
  const [shopLane, setShopLane] = useState<ShopLaneId>(
    product?.shopLane ?? laneForDomain(product?.domain ?? "ceramika"),
  );
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const laneDomains = SHOP_LANES[shopLane].domains;
  const categories = useMemo(() => categoriesForDomain(categoryOptions, domain), [categoryOptions, domain]);
  const [category, setCategory] = useState(() => firstCategoryId(categoryOptions, domain, product?.category));

  const priceZl = product ? (product.priceInCents / 100).toFixed(0) : "";

  return (
    <form action={action} encType="multipart/form-data" className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <AdminFormSection title="Podstawowe informacje" description="Nazwa i adres produktu w sklepie.">
            <AdminField label="Nazwa produktu" htmlFor="name" required>
              <AdminInput
                id="name"
                name="name"
                required
                value={name}
                placeholder="np. Kubek Mist 250 ml"
                onChange={(event) => {
                  const next = event.target.value;
                  setName(next);
                  if (!slugTouched) setSlug(slugify(next));
                }}
              />
            </AdminField>

            <AdminField
              label="Adres URL (slug)"
              htmlFor="slug"
              hint="Link w sklepie: /sklep/twoj-slug"
              required
            >
              <AdminInput
                id="slug"
                name="slug"
                required
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
              />
            </AdminField>

            <AdminField
              label="Krótki opis (przy cenie)"
              htmlFor="shortDescription"
              hint="Jedno zdanie obok ceny. Puste = bierzemy pierwsze zdanie z pełnego opisu. Tytuł produktu zostaje osobno."
            >
              <AdminInput
                id="shortDescription"
                name="shortDescription"
                defaultValue={product?.shortDescription ?? ""}
                placeholder="np. Miska toczona ręcznie na kole garncarskim."
              />
            </AdminField>
            <AdminField
              label="Pełny opis (poniżej zdjęć)"
              htmlFor="description"
              hint="Cechy, wymiary, pielęgnacja. Nowa linia + myślnik albo • robią listę."
              required
            >
              <AdminTextarea
                id="description"
                name="description"
                required
                defaultValue={product?.description}
                placeholder={"Cechy:\n• Wymiary: średnica około 20 cm\n• Można myć w zmywarce."}
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection
            title="Galeria zdjęć"
            description="Pierwsze zdjęcie będzie miniaturą na liście produktów."
          >
            <ProductImagesField initialImages={product?.images ?? []} />
          </AdminFormSection>

          <AdminFormSection
            title="Cena bazowa"
            description="Cena produktu w sklepie. Wariant może mieć własną cenę (opcjonalnie)."
          >
            <AdminField label="Cena (zł)" htmlFor="priceZl" required>
              <AdminInput
                id="priceZl"
                name="priceZl"
                type="number"
                min={1}
                step={1}
                required
                defaultValue={priceZl}
              />
            </AdminField>
            <AdminField
              label="Próg niskiego stanu"
              htmlFor="lowStockThreshold"
              hint="Alert w panelu poniżej tej liczby."
            >
              <AdminInput
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min={0}
                defaultValue={product?.lowStockThreshold ?? 2}
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection
            title="Warianty (kolor, pojemność, magazyn)"
            description="Tu decydujesz, co klient wybiera w sklepie. Każdy wariant ma własny stan i może mieć własne zdjęcie."
          >
            <ProductVariantsField
              initialVariants={product?.variants}
              imageOptions={product?.images ?? []}
              productSlug={slug}
            />
          </AdminFormSection>

          {catalog.length > 0 ? (
            <AdminFormSection
              title="Często dobierane razem"
              description="Tylko ta belka na karcie produktu. Podpowiedzi „Dobierz zestaw…” liczą się osobno i nie powtórzą tych samych naczyń."
            >
              <RelatedProductsField
                catalog={catalog}
                currentId={product?.id}
                initialIds={product?.relatedIds}
              />
            </AdminFormSection>
          ) : null}

          <AdminFormSection title="SEO" description="Opcjonalnie — domyślnie bierzemy nazwę i opis.">
            <AdminField label="Meta title" htmlFor="metaTitle">
              <AdminInput id="metaTitle" name="metaTitle" defaultValue={product?.metaTitle ?? ""} />
            </AdminField>
            <AdminField label="Meta description" htmlFor="metaDescription">
              <AdminTextarea
                id="metaDescription"
                name="metaDescription"
                defaultValue={product?.metaDescription ?? ""}
              />
            </AdminField>
          </AdminFormSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20 xl:max-h-[calc(100dvh-10rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
          <AdminFormSection title="Publikacja">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-czarny/8 bg-krem/40 p-3">
              <input
                type="checkbox"
                name="isPublished"
                value="true"
                defaultChecked={product?.isPublished ?? true}
                className="mt-0.5 accent-czerwony"
              />
              <span className="text-sm">
                <span className="font-medium text-czarny">Opublikowany</span>
                <span className="mt-0.5 block text-xs text-czarny/45">Widoczny w sklepie dla klientów</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-czarny/8 bg-krem/40 p-3">
              <input
                type="checkbox"
                name="isBestseller"
                value="true"
                defaultChecked={product?.isBestseller ?? false}
                className="mt-0.5 accent-czerwony"
              />
              <span className="text-sm">
                <span className="font-medium text-czarny">Bestseller</span>
                <span className="mt-0.5 block text-xs text-czarny/45">Wyróżnienie w analityce i sklepie</span>
              </span>
            </label>
          </AdminFormSection>

          <AdminFormSection
            title="Kategoria sklepu"
            description="Dział na /sklep i filtry katalogu. Wybór sklepu jest niezależny od reszty formularza."
          >
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-czarny">
                Dział sklepu <span className="text-czerwony">*</span>
              </legend>
              <input type="hidden" name="shopLane" value={shopLane} />
              <div className="grid gap-2">
                {(Object.values(SHOP_LANES) as (typeof SHOP_LANES)[ShopLaneId][]).map((lane) => {
                  const selected = shopLane === lane.id;
                  return (
                    <label
                      key={lane.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                        selected
                          ? "border-czerwony/40 bg-czerwony/5"
                          : "border-czarny/8 bg-krem/40 hover:border-czarny/15"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shopLaneChoice"
                        value={lane.id}
                        checked={selected}
                        onChange={() => {
                          setShopLane(lane.id);
                          const nextDomains = lane.domains;
                          if (!(nextDomains as readonly string[]).includes(domain)) {
                            const nextDomain = nextDomains[0];
                            setDomain(nextDomain);
                            setCategory(firstCategoryId(categoryOptions, nextDomain));
                          }
                        }}
                        className="mt-0.5 accent-czerwony"
                      />
                      <span className="text-sm">
                        <span className="font-medium text-czarny">
                          {lane.label} / {lane.shortLabel}
                        </span>
                        <span className="mt-0.5 block text-xs text-czarny/45">{lane.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <AdminField label="Domena" htmlFor="domain" required>
              <AdminSelect
                id="domain"
                name="domain"
                value={domain}
                onChange={(event) => {
                  const next = event.target.value as ProductDomain;
                  setDomain(next);
                  setShopLane(laneForDomain(next));
                  setCategory(firstCategoryId(categoryOptions, next));
                }}
              >
                {(Object.keys(DOMAIN_LABELS) as ProductDomain[])
                  .filter((key) => key !== "warsztaty")
                  .filter((key) => (laneDomains as readonly string[]).includes(key) || key === domain)
                  .map((key) => (
                    <option key={key} value={key}>
                      {DOMAIN_LABELS[key]}
                    </option>
                  ))}
              </AdminSelect>
            </AdminField>

            <AdminField
              label="Kategoria"
              htmlFor="category"
              required
              hint={
                categories.length === 0
                  ? "Brak kategorii w tym dziale — dodaj ją w CMS → Kategorie."
                  : undefined
              }
            >
              <AdminSelect
                id="category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                {categories.length === 0 ? <option value="">— dodaj kategorię —</option> : null}
                {product?.category && !categories.some((row) => row.id === product.category) ? (
                  <option value={product.category}>{product.category}</option>
                ) : null}
                {categories.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField label="Kolekcja szkliwa" htmlFor="collectionId">
              <AdminSelect id="collectionId" name="collectionId" defaultValue={product?.collectionId ?? ""}>
                <option value="">Bez kolekcji</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <AdminField label="Pojemność (ml)" htmlFor="capacityMl">
                <AdminInput
                  id="capacityMl"
                  name="capacityMl"
                  type="number"
                  min={0}
                  placeholder="180"
                  defaultValue={product?.capacityMl ?? ""}
                />
              </AdminField>
              <AdminField label="Podkategoria" htmlFor="subCategory">
                <AdminInput
                  id="subCategory"
                  name="subCategory"
                  placeholder="espresso"
                  defaultValue={product?.subCategory ?? ""}
                />
              </AdminField>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Pielęgnacja">
            <AdminField label="Instrukcje dla klienta" htmlFor="careInstructions">
              <AdminTextarea
                id="careInstructions"
                name="careInstructions"
                defaultValue={product?.careInstructions ?? ""}
                placeholder="Zmywarka OK, unikać szoku termicznego…"
              />
            </AdminField>
          </AdminFormSection>
        </aside>
      </div>

      <AdminFormActions submitLabel={submitLabel} cancelHref="/admin/produkty" />
    </form>
  );
}
