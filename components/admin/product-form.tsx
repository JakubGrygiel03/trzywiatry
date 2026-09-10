"use client";

import { useMemo, useState } from "react";
import { ProductImagesField } from "@/components/admin/product-images-field";
import { ProductVariantsField } from "@/components/admin/product-variants-field";
import { RelatedProductsField } from "@/components/admin/related-products-field";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import {
  CATEGORIES_BY_DOMAIN,
  CATEGORY_LABELS,
  DOMAIN_LABELS,
} from "@/lib/constants";
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

export function ProductForm({
  action,
  product,
  collections,
  catalog = [],
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  collections: Collection[];
  catalog?: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [domain, setDomain] = useState<ProductDomain>(product?.domain ?? "ceramika");
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const categories = useMemo(() => CATEGORIES_BY_DOMAIN[domain] ?? [], [domain]);
  const defaultCategory =
    product?.category && categories.includes(product.category) ? product.category : categories[0];
  const [category, setCategory] = useState(defaultCategory ?? "kubki");

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

            <AdminField label="Opis" htmlFor="description" required>
              <AdminTextarea
                id="description"
                name="description"
                required
                defaultValue={product?.description}
                placeholder="Krótki opis dla klienta — materiał, szkliwo, zastosowanie."
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
            title="Warianty i magazyn"
            description="Tu ustawiasz ilość sztuk oraz zaznaczasz „Brak w magazynie” — to steruje nakładką w sklepie."
          >
            <ProductVariantsField initialVariants={product?.variants} />
          </AdminFormSection>

          {catalog.length > 0 ? (
            <AdminFormSection
              title="Produkty pokrewne"
              description="Pokazują się jako „często dobierane” — np. forma ucha przy formie czarki."
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

        <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
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

          <AdminFormSection title="Kategoria sklepu" description="Filtry na /sklep czytają te pola.">
            <AdminField label="Domena" htmlFor="domain" required>
              <AdminSelect
                id="domain"
                name="domain"
                value={domain}
                onChange={(event) => {
                  const next = event.target.value as ProductDomain;
                  setDomain(next);
                  const nextCats = CATEGORIES_BY_DOMAIN[next] ?? [];
                  setCategory(nextCats[0] ?? "kubki");
                }}
              >
                {(Object.keys(DOMAIN_LABELS) as ProductDomain[])
                  .filter((key) => key !== "warsztaty")
                  .map((key) => (
                    <option key={key} value={key}>
                      {DOMAIN_LABELS[key]}
                    </option>
                  ))}
              </AdminSelect>
            </AdminField>

            <AdminField label="Kategoria" htmlFor="category" required>
              <AdminSelect
                id="category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key] ?? key}
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
