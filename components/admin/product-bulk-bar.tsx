import { bulkUpdateProducts } from "@/app/actions/admin-products";
import { AdminSelect } from "@/components/admin/ui/admin-field";
import type { ShopCategoryGroup } from "@/lib/product-categories";

export function ProductBulkBar({
  categoryTree,
  q,
  category,
}: {
  categoryTree: ShopCategoryGroup[];
  q?: string;
  category?: string;
}) {
  return (
    <form
      id="bulk-products"
      action={bulkUpdateProducts}
      className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-czarny/8 bg-bialy px-4 py-3"
    >
      {q ? <input type="hidden" name="q" value={q} /> : null}
      {category ? <input type="hidden" name="kategoria" value={category} /> : null}
      <p className="mr-auto text-xs text-czarny/50">Zaznacz naczynia poniżej, potem zmień kategorię albo publikację naraz.</p>
      <label className="space-y-1">
        <span className="block text-[11px] font-medium text-czarny/55">Kategoria</span>
        <AdminSelect name="category" defaultValue="">
          <option value="">Bez zmian</option>
          {categoryTree.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {group.children.map((child) => (
                <option key={child.id} value={child.category}>
                  {child.label}
                </option>
              ))}
            </optgroup>
          ))}
        </AdminSelect>
      </label>
      <label className="space-y-1">
        <span className="block text-[11px] font-medium text-czarny/55">Publikacja</span>
        <AdminSelect name="publish" defaultValue="">
          <option value="">Bez zmian</option>
          <option value="1">Opublikuj</option>
          <option value="0">Ukryj</option>
        </AdminSelect>
      </label>
      <button
        type="submit"
        className="rounded-lg bg-czarny px-3.5 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony"
      >
        Zastosuj do zaznaczonych
      </button>
    </form>
  );
}
