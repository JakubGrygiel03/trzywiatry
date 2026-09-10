import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteProduct, updateProduct } from "@/app/actions/admin-products";
import { ProductForm } from "@/components/admin/product-form";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { PublishBadge } from "@/components/admin/ui/admin-status-badge";
import { CATEGORY_LABELS, DOMAIN_LABELS } from "@/lib/constants";
import { getAllProducts, getCollections, getProductById } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import { getProductPhoto } from "@/lib/media";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zapisano?: string; blad?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const product = getProductById(id);
  if (!product) notFound();
  const collections = getCollections();
  const catalog = getAllProducts().map((item) => ({ id: item.id, name: item.name }));
  const cover = getProductPhoto(product) ?? product.images[0];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={product.name}
        description={`${DOMAIN_LABELS[product.domain]} · ${CATEGORY_LABELS[product.category] ?? product.category} · ${formatPLN(product.priceInCents)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PublishBadge published={product.isPublished} />
            <Link
              href={`/sklep/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              Podgląd
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/admin/produkty"
              className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              ← Lista
            </Link>
          </div>
        }
      />

      {cover ? (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-czarny/8 bg-bialy p-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-krem">
            <Image src={cover} alt="" fill className="object-cover" sizes="64px" unoptimized />
          </div>
          <p className="text-sm text-czarny/55">
            {product.images.length} {product.images.length === 1 ? "zdjęcie" : "zdjęć"} w galerii · slug:{" "}
            <span className="font-mono text-xs text-czarny/70">{product.slug}</span>
          </p>
        </div>
      ) : null}

      {query.zapisano ? <AdminAlert variant="success">Zapisano. Sklep odświeżony.</AdminAlert> : null}
      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}

      <div className="mt-6 space-y-6">
        <ProductForm
          action={updateProduct}
          product={product}
          collections={collections}
          catalog={catalog}
          submitLabel="Zapisz zmiany"
        />

        <form action={deleteProduct} className="rounded-xl border border-czerwony/20 bg-bialy p-4">
          <input type="hidden" name="id" value={product.id} />
          <p className="text-sm font-medium text-czarny">Usuń produkt</p>
          <p className="mt-1 text-xs text-czarny/50">
            Produkt zniknie z katalogu w tej sesji serwera. Możesz też odznaczyć „Opublikowany”, żeby tylko ukryć go w
            sklepie.
          </p>
          <button
            type="submit"
            className="mt-3 rounded-lg border border-czerwony/30 px-3.5 py-2 text-xs font-medium text-czerwony transition hover:bg-czerwony/5"
          >
            Usuń produkt
          </button>
        </form>
      </div>
    </div>
  );
}
