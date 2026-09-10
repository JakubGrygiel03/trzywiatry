"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import type { ProductVariant } from "@/lib/types";

type DraftVariant = {
  key: string;
  id?: string;
  title: string;
  sku: string;
  stockQuantity: number;
  priceZl: string;
  outOfStock: boolean;
  color: string;
  colorHex: string;
  capacityMl: string;
};

function toDraft(variant: ProductVariant): DraftVariant {
  const outOfStock = variant.stockQuantity <= 0 || !variant.isAvailable;
  return {
    key: variant.id,
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    stockQuantity: outOfStock ? 0 : variant.stockQuantity,
    priceZl: variant.priceInCents != null ? (variant.priceInCents / 100).toFixed(0) : "",
    outOfStock,
    color: variant.color ?? "",
    colorHex: variant.colorHex ?? "",
    capacityMl: variant.capacityMl != null ? String(variant.capacityMl) : "",
  };
}

function emptyDraft(): DraftVariant {
  return {
    key: crypto.randomUUID(),
    title: "",
    sku: "",
    stockQuantity: 1,
    priceZl: "",
    outOfStock: false,
    color: "",
    colorHex: "",
    capacityMl: "",
  };
}

/** Multi-variant editor — stock qty + „brak w magazynie” for the shop overlay. */
export function ProductVariantsField({
  initialVariants,
}: {
  initialVariants?: ProductVariant[];
}) {
  const [variants, setVariants] = useState<DraftVariant[]>(
    initialVariants?.length ? initialVariants.map(toDraft) : [emptyDraft()],
  );

  function update(key: string, patch: Partial<DraftVariant>) {
    setVariants((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function remove(key: string) {
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)));
  }

  const payload = variants.map((variant) => {
    const stock = variant.outOfStock ? 0 : Math.max(0, Number(variant.stockQuantity) || 0);
    return {
      id: variant.id,
      title: variant.title.trim(),
      sku: variant.sku.trim().toUpperCase(),
      stockQuantity: stock,
      priceZl: variant.priceZl.trim() === "" ? undefined : Number(variant.priceZl),
      isAvailable: !variant.outOfStock && stock > 0,
      color: variant.color.trim() || undefined,
      colorHex: variant.colorHex.trim() || undefined,
      capacityMl: variant.capacityMl.trim() === "" ? undefined : Number(variant.capacityMl),
    };
  });

  return (
    <div className="space-y-4">
      <input type="hidden" name="variantsJson" value={JSON.stringify(payload)} />

      {variants.map((variant, index) => (
        <div key={variant.key} className="rounded-xl border border-czarny/10 bg-krem/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-czarny/45">
              Wariant {index + 1}
              {index === 0 ? " · główny" : ""}
            </p>
            <button
              type="button"
              onClick={() => remove(variant.key)}
              disabled={variants.length <= 1}
              className="rounded p-1.5 text-czerwony hover:bg-bialy disabled:opacity-30"
              aria-label="Usuń wariant"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Nazwa wariantu" required>
              <AdminInput
                value={variant.title}
                onChange={(e) => update(variant.key, { title: e.target.value })}
                placeholder="np. Szkliwo Mist / 250 ml"
                required={index === 0}
              />
            </AdminField>
            <AdminField label="SKU" required>
              <AdminInput
                value={variant.sku}
                onChange={(e) => update(variant.key, { sku: e.target.value })}
                placeholder="TW-CUP-MIST-250"
                required={index === 0}
              />
            </AdminField>
            <AdminField label="Kolor" hint="Np. Sakura. Puste = wariant tylko po nazwie.">
              <AdminInput
                value={variant.color}
                onChange={(e) => update(variant.key, { color: e.target.value })}
                placeholder="Granatowy"
              />
            </AdminField>
            <AdminField label="Próbka koloru (hex)">
              <AdminInput
                value={variant.colorHex}
                onChange={(e) => update(variant.key, { colorHex: e.target.value })}
                placeholder="#2c3d5a"
              />
            </AdminField>
            <AdminField label="Pojemność (ml)" hint="Osobny chip na karcie produktu, jak u Fobe.">
              <AdminInput
                type="number"
                min={1}
                value={variant.capacityMl}
                onChange={(e) => update(variant.key, { capacityMl: e.target.value })}
                placeholder="250"
              />
            </AdminField>
            <AdminField
              label="Cena wariantu (zł)"
              hint={index === 0 ? "Pusta = cena produktu z pola powyżej." : "Opcjonalna cena inna niż bazowa."}
            >
              <AdminInput
                type="number"
                min={0}
                step={1}
                value={variant.priceZl}
                onChange={(e) => update(variant.key, { priceZl: e.target.value })}
                placeholder="np. 129"
              />
            </AdminField>
          </div>

          <div className="mt-4 rounded-lg border border-czarny/10 bg-bialy p-3">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-czarny/45">Magazyn</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <AdminField
                label="Ilość w magazynie"
                hint="Ta liczba steruje dostępnością w sklepie."
              >
                <AdminInput
                  type="number"
                  min={0}
                  value={variant.outOfStock ? 0 : variant.stockQuantity}
                  disabled={variant.outOfStock}
                  onChange={(e) => {
                    const next = Math.max(0, Number(e.target.value) || 0);
                    update(variant.key, {
                      stockQuantity: next,
                      outOfStock: next <= 0,
                    });
                  }}
                />
              </AdminField>
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-czarny/10 px-3 text-sm text-czarny/80">
                <input
                  type="checkbox"
                  checked={variant.outOfStock}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    update(variant.key, {
                      outOfStock: checked,
                      stockQuantity: checked ? 0 : Math.max(1, variant.stockQuantity),
                    });
                  }}
                  className="accent-czerwony"
                />
                Brak w magazynie
              </label>
            </div>
            {variant.outOfStock ? (
              <p className="mt-2 text-xs text-czerwony">
                W sklepie pojawi się nakładka „Brak w magazynie”, a przycisk dodania do koszyka będzie wyłączony.
              </p>
            ) : null}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setVariants((prev) => [...prev, emptyDraft()])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/12 bg-bialy px-3 py-2 text-xs font-medium text-czarny/70 transition hover:border-czerwony/30 hover:text-czerwony"
      >
        <Plus className="h-3.5 w-3.5" />
        Dodaj wariant
      </button>
    </div>
  );
}
