import { TicketPercent } from "lucide-react";
import { connection } from "next/server";
import { saveShopCoupon } from "@/app/actions/admin-coupons";
import { CouponEditRow } from "@/components/admin/coupon-edit-row";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/ui/admin-field";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getShopCoupons } from "@/lib/shop-coupons";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ zapisano?: string; usunieto?: string; blad?: string }>;
}) {
  await connection();
  await ensureAtelierHydrated({ force: true });
  const query = await searchParams;
  const coupons = getShopCoupons();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Kupony rabatowe"
        description="Kody sklepowe działają w kasie obok kodu z newslettera i hasła kampanii. Kwoty w złotych, procent do 80%. Istniejący kupon edytujesz na liście — licznik użyć zostaje."
      />
      {query.zapisano ? <AdminAlert variant="success">Zapisano kupon.</AdminAlert> : null}
      {query.usunieto ? <AdminAlert variant="success">Usunięto kupon.</AdminAlert> : null}
      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}

      <form
        action={saveShopCoupon}
        className="mb-6 grid gap-3 rounded-xl border border-czarny/8 bg-bialy p-5 sm:grid-cols-2"
      >
        <AdminField label="Kod" htmlFor="code" required>
          <AdminInput id="code" name="code" required maxLength={24} placeholder="np. GARNIEC" />
        </AdminField>
        <AdminField label="Typ" htmlFor="kind">
          <AdminSelect id="kind" name="kind" defaultValue="percent">
            <option value="percent">Procent</option>
            <option value="fixed">Kwota (zł)</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Wartość" htmlFor="value" hint="% albo zł" required>
          <AdminInput id="value" name="value" type="number" min={1} step={1} required />
        </AdminField>
        <AdminField label="Ważny do" htmlFor="expiresAt">
          <AdminInput id="expiresAt" name="expiresAt" type="date" />
        </AdminField>
        <AdminField label="Limit użyć" htmlFor="maxUses">
          <AdminInput id="maxUses" name="maxUses" type="number" min={1} step={1} />
        </AdminField>
        <AdminField label="Min. koszyk (zł)" htmlFor="minGoodsZl">
          <AdminInput id="minGoodsZl" name="minGoodsZl" type="number" min={0} step={1} />
        </AdminField>
        <label className="flex items-center gap-2 text-sm">
          <input type="hidden" name="oncePerEmail" value="false" />
          <input type="checkbox" name="oncePerEmail" value="true" className="accent-czerwony" />
          Raz na e-mail
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="hidden" name="enabled" value="false" />
          <input type="checkbox" name="enabled" value="true" defaultChecked className="accent-czerwony" />
          Włączony
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg bg-czarny px-4 text-xs font-medium text-bialy transition hover:bg-czerwony sm:col-span-2"
        >
          Dodaj kupon
        </button>
      </form>

      {coupons.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={TicketPercent}
            title="Brak kuponów"
            description="Dodaj kod — klient wpisze go w kasie przy zamówieniu."
          />
        </div>
      ) : (
        <ul className="divide-y divide-czarny/5 overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
          {coupons.map((coupon) => (
            <CouponEditRow key={coupon.id} coupon={coupon} />
          ))}
        </ul>
      )}
    </div>
  );
}
