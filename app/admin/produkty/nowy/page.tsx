import Link from "next/link";
import { createProduct } from "@/app/actions/admin-products";
import { ProductForm } from "@/components/admin/product-form";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getAllProducts, getCollections } from "@/lib/data/queries";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  const { blad } = await searchParams;
  const collections = getCollections();
  const catalog = getAllProducts().map((item) => ({ id: item.id, name: item.name }));

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Nowy produkt"
        description="Uzupełnij dane, dodaj zdjęcia i opublikuj — produkt trafi do filtrów sklepu."
        actions={
          <Link
            href="/admin/produkty"
            className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
          >
            ← Lista produktów
          </Link>
        }
      />

      {blad ? <AdminAlert variant="error">{decodeURIComponent(blad)}</AdminAlert> : null}

      <div className="mt-6">
        <ProductForm
          action={createProduct}
          collections={collections}
          catalog={catalog}
          submitLabel="Dodaj produkt"
        />
      </div>
    </div>
  );
}
