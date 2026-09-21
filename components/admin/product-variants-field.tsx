"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import { glazeColorHex } from "@/lib/glaze-colors";
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
  image: string;
  /** Title was auto-built from color/capacity — keep syncing until admin edits it. */
  titleAuto: boolean;
};

function buildTitle(color: string, capacityMl: string, fallback: string) {
  const parts = [color.trim(), capacityMl.trim() ? `${capacityMl.trim()} ml` : ""].filter(Boolean);
  return parts.join(" · ") || fallback;
}

function toDraft(variant: ProductVariant): DraftVariant {
  const outOfStock = variant.stockQuantity <= 0 || !variant.isAvailable;
  const color = variant.color ?? "";
  const capacityMl = variant.capacityMl != null ? String(variant.capacityMl) : "";
  const auto = buildTitle(color, capacityMl, "");
  return {
    key: variant.id,
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    stockQuantity: outOfStock ? 0 : variant.stockQuantity,
    priceZl: variant.priceInCents != null ? (variant.priceInCents / 100).toFixed(0) : "",
    outOfStock,
    color,
    colorHex: variant.colorHex ?? glazeColorHex(color) ?? "",
    capacityMl,
    image: variant.image ?? "",
    titleAuto: Boolean(auto) && auto === variant.title,
  };
}

function emptyDraft(index: number): DraftVariant {
  return {
    key: crypto.randomUUID(),
    title: index === 0 ? "Standard" : "",
    sku: "",
    stockQuantity: 1,
    priceZl: "",
    outOfStock: false,
    color: "",
    colorHex: "",
    capacityMl: "",
    image: "",
    titleAuto: true,
  };
}

/** Simple variant editor — colour / capacity / stock. Admin has full control. */
export function ProductVariantsField({
  initialVariants,
  imageOptions = [],
}: {
  initialVariants?: ProductVariant[];
  imageOptions?: string[];
}) {
  const [variants, setVariants] = useState<DraftVariant[]>(
    initialVariants?.length ? initialVariants.map(toDraft) : [emptyDraft(0)],
  );

  function update(key: string, patch: Partial<DraftVariant>) {
    setVariants((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const next = { ...item, ...patch };
        if ("color" in patch && !("colorHex" in patch)) {
          const suggested = glazeColorHex(next.color);
          if (suggested) next.colorHex = suggested;
        }
        if (next.titleAuto && ("color" in patch || "capacityMl" in patch)) {
          next.title = buildTitle(next.color, next.capacityMl, item.title || "Wariant");
        }
        return next;
      }),
    );
  }

  function remove(key: string) {
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)));
  }

  const payload = variants.map((variant) => {
    const stock = variant.outOfStock ? 0 : Math.max(0, Number(variant.stockQuantity) || 0);
    return {
      id: variant.id,
      title: variant.title.trim() || buildTitle(variant.color, variant.capacityMl, "Wariant"),
      sku: variant.sku.trim().toUpperCase() || `TW-${variant.key.slice(0, 8).toUpperCase()}`,
      stockQuantity: stock,
      priceZl: variant.priceZl.trim() === "" ? undefined : Number(variant.priceZl),
      isAvailable: !variant.outOfStock && stock > 0,
      color: variant.color.trim() || undefined,
      colorHex: variant.colorHex.trim() || glazeColorHex(variant.color) || undefined,
      capacityMl: variant.capacityMl.trim() === "" ? undefined : Number(variant.capacityMl),
      image: variant.image.trim() || undefined,
    };
  });

  return (
    <div className="space-y-4">
      <input type="hidden" name="variantsJson" value={JSON.stringify(payload)} />

      <p className="rounded-xl border border-czarny/8 bg-krem/40 px-3 py-2.5 text-xs leading-relaxed text-czarny/65">
        Każdy wariant = osobny wybór w sklepie (kolor, pojemność, stan). Uzupełnij kolor i/lub pojemność —
        nazwa dla klienta uzupełni się sama. Możesz ją potem zmienić ręcznie.
      </p>

      {variants.map((variant, index) => (
        <div key={variant.key} className="rounded-xl border border-czarny/10 bg-krem/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-czarny/45">
              Wariant {index + 1}
              {index === 0 ? " · domyślny" : ""}
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
            <AdminField
              label="Kolor (opcjonalnie)"
              hint="Np. Czerwony — w sklepie pojawią się kółka kolorów."
            >
              <div className="flex items-center gap-2">
                <AdminInput
                  value={variant.color}
                  onChange={(e) => update(variant.key, { color: e.target.value })}
                  placeholder="Granatowy"
                />
                <span
                  className="size-9 shrink-0 rounded-full border border-czarny/15"
                  style={{ background: variant.colorHex || glazeColorHex(variant.color) || "#aaa9a5" }}
                  title={variant.colorHex || "brak próbki"}
                />
              </div>
            </AdminField>

            <AdminField label="Pojemność (ml)" hint="Np. 250 — chip na karcie produktu.">
              <AdminInput
                type="number"
                min={1}
                value={variant.capacityMl}
                onChange={(e) => update(variant.key, { capacityMl: e.target.value })}
                placeholder="250"
              />
            </AdminField>

            <AdminField
              label="Nazwa dla klienta"
              required
              hint="To widać w koszyku i na zamówieniu."
            >
              <AdminInput
                value={variant.title}
                onChange={(e) =>
                  update(variant.key, { title: e.target.value, titleAuto: false })
                }
                placeholder="np. Czerwony · 250 ml"
                required={index === 0}
              />
            </AdminField>

            <AdminField
              label="Stan magazynowy"
              hint="0 = wyprzedane w sklepie."
            >
              <div className="flex flex-wrap items-center gap-3">
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
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-czarny/10 bg-bialy px-3 text-sm text-czarny/80">
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
                  Brak
                </label>
              </div>
            </AdminField>

            <AdminField
              label="Cena wariantu (zł)"
              hint="Puste = cena produktu z pola powyżej."
            >
              <AdminInput
                type="number"
                min={0}
                step={1}
                value={variant.priceZl}
                onChange={(e) => update(variant.key, { priceZl: e.target.value })}
                placeholder="opcjonalnie"
              />
            </AdminField>

            <AdminField
              label="Zdjęcie tego wariantu"
              hint="Po wyborze koloru w sklepie wskakuje ten kadr."
            >
              <select
                value={variant.image}
                onChange={(e) => update(variant.key, { image: e.target.value })}
                className="h-11 w-full rounded-lg border border-czarny/12 bg-bialy px-3 text-sm"
              >
                <option value="">Jak pierwsze zdjęcie produktu</option>
                {imageOptions.map((url) => (
                  <option key={url} value={url}>
                    {url.split("/").pop()}
                  </option>
                ))}
                {variant.image && !imageOptions.includes(variant.image) ? (
                  <option value={variant.image}>{variant.image.split("/").pop()}</option>
                ) : null}
              </select>
            </AdminField>

            <AdminField label="SKU" hint="Kod magazynowy — można zostawić puste przy nowym wariancie.">
              <AdminInput
                value={variant.sku}
                onChange={(e) => update(variant.key, { sku: e.target.value })}
                placeholder="TW-…"
              />
            </AdminField>

            <AdminField label="Próbka koloru (hex)" hint="Uzupełnia się po wpisaniu koloru — możesz zmienić.">
              <AdminInput
                value={variant.colorHex}
                onChange={(e) => update(variant.key, { colorHex: e.target.value })}
                placeholder="#b84a6a"
              />
            </AdminField>
          </div>

          {variant.outOfStock ? (
            <p className="mt-3 text-xs text-czerwony">
              W sklepie: nakładka „Brak w magazynie” i wyłączony przycisk koszyka.
            </p>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setVariants((prev) => [...prev, emptyDraft(prev.length)])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/12 bg-bialy px-3 py-2 text-xs font-medium text-czarny/70 transition hover:border-czerwony/30 hover:text-czerwony"
      >
        <Plus className="h-3.5 w-3.5" />
        Dodaj wariant
      </button>
    </div>
  );
}
