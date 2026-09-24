import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { sendStudioMonthlyReport } from "@/app/actions/admin-orders";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { OrderStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { formatPLN } from "@/lib/format";
import { orderPaymentDisplay } from "@/lib/p24-methods";
import { filterOrders, monthWindow } from "@/lib/reports/orders-csv";
import { isAbandonedCheckout } from "@/lib/orders/studio-queue";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    usunieto?: string;
    blad?: string;
    raport?: string;
    okres?: string;
    powod?: string;
  }>;
}) {
  const query = await searchParams;
  await ensureOrdersHydrated({ force: true });
  const q = query.q?.trim() ?? "";
  const period = monthWindow();
  const orders = filterOrders(
    [...runtimeStore.orders]
      .filter((order) => !isAbandonedCheckout(order))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    q,
  );
  const exportHref = q
    ? `/admin/zamowienia/export?q=${encodeURIComponent(q)}`
    : "/admin/zamowienia/export";

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <AdminPageHeader
        title="Zamówienia"
        description="Szukaj, pobierz CSV albo usuń test. Raport miesięczny idzie na trzywiatrystudio@gmail.com."
      />

      {query.usunieto ? (
        <AdminAlert variant="success">Usunięto {query.usunieto}.</AdminAlert>
      ) : null}
      {query.blad ? <AdminAlert variant="error">Nie udało się zapisać zmiany.</AdminAlert> : null}
      {query.raport === "1" ? (
        <AdminAlert variant="success">Wysłano raport za {query.okres} na skrzynkę pracowni.</AdminAlert>
      ) : null}
      {query.raport === "0" ? (
        <AdminAlert variant="error">Raport nie wyszedł. {query.powod ?? "Sprawdź SMTP_PASS."}</AdminAlert>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-czarny/8 bg-bialy p-4 sm:flex-row sm:items-end sm:justify-between">
        <form className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1 text-xs">
            <span className="mb-1 block text-czarny/45">Szukaj</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="TW-0010, e-mail, telefon, miasto…"
              className="h-10 w-full rounded-lg border border-czarny/12 bg-krem/30 px-3 text-sm outline-none focus:border-czerwony"
            />
          </label>
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-czarny px-4 text-sm font-medium text-bialy"
          >
            Szukaj
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Link
            href={exportHref}
            className="inline-flex h-10 items-center rounded-lg border border-czarny/12 px-4 text-sm font-medium text-czarny"
          >
            Pobierz CSV
          </Link>
          <form action={sendStudioMonthlyReport}>
            <input type="hidden" name="month" value={period.key} />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg border border-czerwony/30 px-4 text-sm font-medium text-czerwony"
            >
              Wyślij raport {period.label}
            </button>
          </form>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={ShoppingBag}
            title={q ? "Nic nie pasuje" : "Brak zamówień"}
            description={
              q
                ? "Zmień frazę albo wyczyść wyszukiwanie."
                : "Złóż testowe zamówienie w sklepie — lista wypełni się automatycznie."
            }
            action={
              q ? (
                <Link href="/admin/zamowienia" className="text-xs font-medium text-czerwony underline-offset-2 hover:underline">
                  Pokaż wszystkie
                </Link>
              ) : (
                <Link href="/sklep" className="text-xs font-medium text-czerwony underline-offset-2 hover:underline">
                  Otwórz sklep
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy shadow-[0_1px_0_rgb(1_1_1/0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-czarny/8 bg-krem/40 text-[11px] uppercase tracking-[0.1em] text-czarny/45">
                  <th className="px-4 py-3 font-medium">Numer</th>
                  <th className="px-4 py-3 font-medium">Klient</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Płatność</th>
                  <th className="px-4 py-3 font-medium">Uwagi</th>
                  <th className="px-4 py-3 font-medium">Wysyłka</th>
                  <th className="px-4 py-3 text-right font-medium">Kwota</th>
                  <th className="px-4 py-3 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={
                      order.hasGiftWrapping
                        ? "border-b border-czerwony/20 bg-czerwony/[0.07] last:border-0 hover:bg-czerwony/10"
                        : "border-b border-czarny/5 last:border-0 hover:bg-krem/30"
                    }
                  >
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
                    <td className="px-4 py-3 text-czarny/70">{orderPaymentDisplay(order)}</td>
                    <td className="px-4 py-3">
                      {order.hasGiftWrapping ? (
                        <span className="inline-flex rounded-full bg-czerwony px-3 py-1 font-heading text-[10px] uppercase tracking-[0.14em] text-bialy">
                          Prezent
                        </span>
                      ) : (
                        <span className="text-czarny/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-czarny/55">{order.shippingMethod}</td>
                    <td className="px-4 py-3 text-right font-heading text-xs">
                      {formatPLN(order.totalAmountInCents)}
                    </td>
                    <td className="px-4 py-3">
                      <DeleteOrderButton id={order.id} orderNumber={order.orderNumber} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-czarny/6 px-4 py-2.5 text-xs text-czarny/40">
            {orders.length} zamówień{q ? ` · filtr „${q}”` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
