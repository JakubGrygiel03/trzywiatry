import Link from "next/link";
import { Users } from "lucide-react";
import { connection } from "next/server";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { customersFromOrders, getCustomerNote } from "@/lib/customer-notes";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { formatDate, formatPLN } from "@/lib/format";
import { isAbandonedCheckout } from "@/lib/orders/studio-queue";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  await connection();
  await ensureOrdersHydrated({ force: true });
  await ensureAtelierHydrated({ force: true });
  const { blad } = await searchParams;
  const customers = customersFromOrders(runtimeStore.orders.filter((order) => !isAbandonedCheckout(order)));

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Klienci"
        description="Zbiorcze widoki z zamówień. Notatka wewnętrzna nie wychodzi do klienta."
      />
      {blad ? <AdminAlert variant="error">Nie udało się zapisać notatki.</AdminAlert> : null}
      {customers.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState icon={Users} title="Brak klientów" description="Pojawią się po pierwszym zamówieniu." />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-czarny/8 bg-bialy">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.12em] text-czarny/40">
              <tr>
                <th className="px-4 py-3">Klient</th>
                <th className="px-4 py-3">Zamówienia</th>
                <th className="px-4 py-3">Suma</th>
                <th className="px-4 py-3">Ostatnie</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.email} className="border-t border-czarny/6">
                  <td className="px-4 py-3">
                    <p>{customer.name}</p>
                    <p className="text-xs text-czarny/45">{customer.email}</p>
                    {getCustomerNote(customer.email)?.note ? (
                      <p className="mt-1 text-xs text-czerwony">Jest notatka</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="px-4 py-3">{formatPLN(customer.spent)}</td>
                  <td className="px-4 py-3 text-czarny/55">{formatDate(customer.lastAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/klienci/${encodeURIComponent(customer.email)}`}
                      className="text-xs text-czerwony"
                    >
                      Kartoteka
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
