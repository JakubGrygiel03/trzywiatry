import { addCatalogOrderItem, addCustomOrderItem } from "@/app/actions/admin-orders";
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/ui/admin-field";
import { formatPLN } from "@/lib/format";

export type OrderCatalogOption = {
  id: string;
  name: string;
  variants: { id: string; title: string; stockQuantity: number; priceInCents: number }[];
};

export function AdminOrderAddItems({
  orderId,
  catalog,
}: {
  orderId: string;
  catalog: OrderCatalogOption[];
}) {
  return (
    <div className="grid gap-5 border-t border-czarny/6 px-5 py-5 lg:grid-cols-2">
      <form action={addCatalogOrderItem} className="space-y-3">
        <p className="text-sm font-medium text-czarny">Dodaj z katalogu</p>
        <input type="hidden" name="orderId" value={orderId} />
        <AdminField label="Produkt i wariant" htmlFor="variantId" required>
          <AdminSelect id="variantId" name="variantId" required defaultValue="">
            <option value="" disabled>
              Wybierz naczynie
            </option>
            {catalog.map((product) => (
              <optgroup key={product.id} label={product.name}>
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title} · {variant.stockQuantity} szt. · {formatPLN(variant.priceInCents)}
                  </option>
                ))}
              </optgroup>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Ilość" htmlFor="catalogQty">
          <AdminInput id="catalogQty" name="quantity" type="number" min={1} max={99} defaultValue={1} />
        </AdminField>
        <button
          type="submit"
          className="rounded-lg bg-czarny px-3.5 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony"
        >
          Dodaj produkt
        </button>
      </form>

      <form action={addCustomOrderItem} className="space-y-3">
        <p className="text-sm font-medium text-czarny">Pozycja indywidualna</p>
        <input type="hidden" name="orderId" value={orderId} />
        <AdminField label="Nazwa" htmlFor="customName" required>
          <AdminInput id="customName" name="name" required placeholder="np. Miseczka na zamówienie" />
        </AdminField>
        <AdminField label="Opis / wariant" htmlFor="customVariant">
          <AdminInput id="customVariant" name="variantTitle" placeholder="np. szkliwo Mist" />
        </AdminField>
        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Cena szt. (zł)" htmlFor="customPrice" required>
            <AdminInput id="customPrice" name="priceZl" type="number" min={0} step={1} required defaultValue={0} />
          </AdminField>
          <AdminField label="Ilość" htmlFor="customQty">
            <AdminInput id="customQty" name="quantity" type="number" min={1} max={99} defaultValue={1} />
          </AdminField>
        </div>
        <button
          type="submit"
          className="rounded-lg border border-czarny/12 px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
        >
          Dopisz pozycję
        </button>
      </form>
    </div>
  );
}
