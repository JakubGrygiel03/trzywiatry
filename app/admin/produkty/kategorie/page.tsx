import Link from "next/link";
import { Tags } from "lucide-react";
import { connection } from "next/server";
import {
  createProductCategory,
  deleteProductCategory,
  renameProductCategory,
} from "@/app/actions/admin-categories";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/ui/admin-field";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { DOMAIN_LABELS } from "@/lib/constants";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getAllProducts, getProductCategories } from "@/lib/data/queries";
import { shopCategoryTreeFrom } from "@/lib/product-categories";
import type { ProductDomain } from "@/lib/types";

export const dynamic = "force-dynamic";

const DOMAIN_OPTIONS: ProductDomain[] = ["ceramika", "drewno", "formy"];

export default async function AdminProductCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ zapisano?: string; usunieto?: string; blad?: string }>;
}) {
  await connection();
  await ensureAtelierHydrated({ force: true });
  const query = await searchParams;
  const categories = getProductCategories();
  const tree = shopCategoryTreeFrom(categories);
  const usage = new Map<string, number>();
  for (const product of getAllProducts()) {
    usage.set(product.category, (usage.get(product.category) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Kategorie produktów"
        description="Nazwy w filtrach sklepu i w karcie produktu. Nowa kategoria od razu pojawia się w CMS i na /sklep."
        actions={
          <Link
            href="/admin/produkty"
            className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
          >
            ← Lista produktów
          </Link>
        }
      />

      {query.zapisano ? <AdminAlert variant="success">Zapisano kategorie.</AdminAlert> : null}
      {query.usunieto ? <AdminAlert variant="success">Kategoria usunięta.</AdminAlert> : null}
      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}

      <form
        action={createProductCategory}
        className="mb-6 grid gap-3 rounded-xl border border-czarny/8 bg-bialy p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end"
      >
        <AdminField label="Nowa kategoria" htmlFor="label" required>
          <AdminInput id="label" name="label" required placeholder="np. Wazony" maxLength={48} />
        </AdminField>
        <AdminField label="Dział" htmlFor="domain" required>
          <AdminSelect id="domain" name="domain" defaultValue="ceramika">
            {DOMAIN_OPTIONS.map((domain) => (
              <option key={domain} value={domain}>
                {DOMAIN_LABELS[domain]}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <button
          type="submit"
          className="h-11 rounded-lg bg-czarny px-4 text-xs font-medium text-bialy transition hover:bg-czerwony"
        >
          Dodaj
        </button>
      </form>

      {tree.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={Tags}
            title="Brak kategorii"
            description="Dodaj pierwszą nazwę — pojawi się w filtrach sklepu i przy nowym produkcie."
          />
        </div>
      ) : (
        <div className="space-y-5">
          {tree.map((group) => (
            <section key={group.id} className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
              <header className="border-b border-czarny/6 px-5 py-3">
                <h2 className="text-sm font-semibold text-czarny">{group.label}</h2>
              </header>
              <ul className="divide-y divide-czarny/5">
                {group.children.map((child) => {
                  const count = usage.get(child.category) ?? 0;
                  return (
                    <li
                      key={child.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap"
                    >
                      <form action={renameProductCategory} className="flex min-w-0 flex-1 items-center gap-2">
                        <input type="hidden" name="id" value={child.category} />
                        <AdminInput
                          name="label"
                          defaultValue={child.label}
                          required
                          maxLength={48}
                          aria-label={`Nazwa kategorii ${child.label}`}
                        />
                        <button
                          type="submit"
                          className="shrink-0 rounded-lg border border-czarny/12 px-3 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
                        >
                          Zapisz
                        </button>
                      </form>
                      <p className="w-24 shrink-0 text-xs text-czarny/45">
                        {count === 0 ? "pusta" : `${count} prod.`}
                      </p>
                      <form action={deleteProductCategory}>
                        <input type="hidden" name="id" value={child.category} />
                        <button
                          type="submit"
                          disabled={count > 0}
                          title={
                            count > 0
                              ? "Najpierw przenieś produkty do innej kategorii"
                              : "Usuń kategorię"
                          }
                          className="rounded-lg border border-czerwony/30 px-3 py-2 text-xs font-medium text-czerwony transition hover:bg-czerwony/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Usuń
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
