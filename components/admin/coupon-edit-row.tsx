import { removeShopCoupon, saveShopCoupon } from "@/app/actions/admin-coupons";
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/ui/admin-field";
import type { ShopCoupon } from "@/lib/types";

export function CouponEditRow({ coupon }: { coupon: ShopCoupon }) {
  const value = coupon.kind === "percent" ? coupon.value : Math.round(coupon.value / 100);
  const minGoodsZl = coupon.minGoodsCents ? Math.round(coupon.minGoodsCents / 100) : "";

  return (
    <li className="space-y-3 px-4 py-4">
      <p className="text-xs text-czarny/40">
        Użyć: {coupon.usedCount}
        {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
      </p>
      <form action={saveShopCoupon} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={coupon.id} />
        <AdminField label="Kod" htmlFor={`code-${coupon.id}`} required>
          <AdminInput id={`code-${coupon.id}`} name="code" required maxLength={24} defaultValue={coupon.code} />
        </AdminField>
        <AdminField label="Typ" htmlFor={`kind-${coupon.id}`}>
          <AdminSelect id={`kind-${coupon.id}`} name="kind" defaultValue={coupon.kind}>
            <option value="percent">Procent</option>
            <option value="fixed">Kwota (zł)</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Wartość" htmlFor={`value-${coupon.id}`} required>
          <AdminInput
            id={`value-${coupon.id}`}
            name="value"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={value}
          />
        </AdminField>
        <AdminField label="Ważny do" htmlFor={`expires-${coupon.id}`}>
          <AdminInput id={`expires-${coupon.id}`} name="expiresAt" type="date" defaultValue={coupon.expiresAt ?? ""} />
        </AdminField>
        <AdminField label="Limit użyć" htmlFor={`max-${coupon.id}`}>
          <AdminInput
            id={`max-${coupon.id}`}
            name="maxUses"
            type="number"
            min={1}
            step={1}
            defaultValue={coupon.maxUses ?? ""}
          />
        </AdminField>
        <AdminField label="Min. koszyk (zł)" htmlFor={`min-${coupon.id}`}>
          <AdminInput
            id={`min-${coupon.id}`}
            name="minGoodsZl"
            type="number"
            min={0}
            step={1}
            defaultValue={minGoodsZl}
          />
        </AdminField>
        <label className="flex items-center gap-2 text-sm">
          <input type="hidden" name="oncePerEmail" value="false" />
          <input
            type="checkbox"
            name="oncePerEmail"
            value="true"
            defaultChecked={coupon.oncePerEmail}
            className="accent-czerwony"
          />
          Raz na e-mail
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="hidden" name="enabled" value="false" />
          <input
            type="checkbox"
            name="enabled"
            value="true"
            defaultChecked={coupon.enabled}
            className="accent-czerwony"
          />
          Włączony
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg border border-czarny/12 px-4 text-xs font-medium text-czarny hover:border-czerwony hover:text-czerwony"
        >
          Zapisz zmiany
        </button>
      </form>
      <form action={removeShopCoupon}>
        <input type="hidden" name="id" value={coupon.id} />
        <button type="submit" className="text-xs text-czarny/40 hover:text-czerwony">
          Usuń kupon
        </button>
      </form>
    </li>
  );
}
