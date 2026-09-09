import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { OrderStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { formatPLN } from "@/lib/format";

export default function AdminOrdersPage() {
  ensureOrdersHydrated();
  const orders = [...runtimeStore.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Zamówienia"
        description="Zmiana statusu może wysłać e-mail do klienta — jak powiadomienia WooCommerce."
      />

      {orders.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={ShoppingBag}
            title="Brak zamówień w tej sesji"
            description="Złóż testowe zamówienie w sklepie — lista wypełni się automatycznie."
            action={
              <Link href="/sklep" className="text-xs font-medium text-czerwony underline-offset-2 hover:underline">
                Otwórz sklep
              </Link>
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy shadow-[0_1px_0_rgb(1_1_1/0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-czarny/8 bg-krem/40 text-[11px] uppercase tracking-[0.1em] text-czarny/45">
                  <th className="px-4 py-3 font-medium">Numer</th>
                  <th className="px-4 py-3 font-medium">Klient</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Wysyłka</th>
                  <th className="px-4 py-3 text-right font-medium">Kwota</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-czarny/5 last:border-0 hover:bg-krem/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/zamowienia/${order.id}`}
                        className="font-medium text-czerwony underline-offset-2 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-czarny/80">{order.customerName}</p>
                      <p className="text-xs text-czarny/40">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-czarny/55">{order.shippingMethod}</td>
                    <td className="px-4 py-3 text-right font-heading text-xs">
                      {formatPLN(order.totalAmountInCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-czarny/6 px-4 py-2.5 text-xs text-czarny/40">
            {orders.length} zamówień
          </div>
        </div>
      )}
    </div>
  );
}
