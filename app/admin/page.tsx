import Link from "next/link";
import {
  AlertTriangle,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card";
import { OrderStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getDashboardMetrics } from "@/lib/data/admin-metrics";
import { remainingSeats } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const PIPELINE: OrderStatus[] = ["pending", "paid", "processing", "shipped", "completed"];

function todayLabel() {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function AdminHomePage() {
  const m = getDashboardMetrics();
  const vacationOn = m.settings.announcementType === "vacation";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Pulpit"
        description={`${todayLabel()} · skrót jak w WooCommerce: sprzedaż, magazyn i kolejka do spakowania.`}
        actions={
          <>
            <Link
              href="/admin/produkty/nowy"
              className="inline-flex items-center gap-1.5 rounded-lg bg-czarny px-3.5 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony"
            >
              <Plus className="h-3.5 w-3.5" />
              Dodaj produkt
            </Link>
            <Link
              href="/admin/zamowienia"
              className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              Zamówienia
            </Link>
          </>
        }
      />

      {vacationOn ? (
        <div className="flex items-start gap-3 rounded-xl border border-ceglany/35 bg-ceglany/10 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-czerwony" />
          <div>
            <p className="font-medium text-czarny">Tryb urlopu jest włączony</p>
            <p className="mt-0.5 text-xs text-czarny/60">
              Klienci widzą komunikat o przerwie.{" "}
              <Link href="/admin/ustawienia-sklepu" className="text-czerwony underline-offset-2 hover:underline">
                Ustawienia sklepu
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Zamówienia"
          value={String(m.orderCount)}
          hint="W tej sesji serwera"
          href="/admin/zamowienia"
          icon={ShoppingBag}
        />
        <AdminStatCard
          label="Przychód"
          value={formatPLN(m.revenue)}
          hint={m.orderCount ? `AOV ${formatPLN(m.aov)}` : "Brak sprzedaży"}
          href="/admin/analityka"
          icon={TrendingUp}
        />
        <AdminStatCard
          label="Produkty w sklepie"
          value={String(m.publishedCount)}
          hint={m.draftCount ? `${m.draftCount} szkiców` : "Wszystkie opublikowane"}
          href="/admin/produkty"
          icon={Package}
        />
        <AdminStatCard
          label="Niski stan"
          value={String(m.lowStockProducts.length)}
          hint={m.outOfStockCount ? `${m.outOfStockCount} wyprzedanych` : "Powyżej progu OK"}
          href="/admin/produkty"
          icon={Warehouse}
          tone={m.lowStockProducts.length ? "warn" : "ok"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <AdminPanel
          title="Ostatnie zamówienia"
          description="Kliknij numer, żeby zmienić status i dodać tracking"
          action={{ href: "/admin/zamowienia", label: "Wszystkie" }}
          bodyClassName="p-0"
        >
          {m.recentOrders.length === 0 ? (
            <AdminEmptyState
              icon={ShoppingBag}
              title="Brak zamówień w tej sesji"
              description="Złóż testowe zamówienie w sklepie — pojawi się tu jak w WooCommerce → Zamówienia."
              action={
                <Link href="/sklep" className="text-xs font-medium text-czerwony underline-offset-2 hover:underline">
                  Przejdź do sklepu
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-czarny/6 text-[11px] uppercase tracking-[0.1em] text-czarny/40">
                    <th className="px-4 py-2.5 font-medium">Numer</th>
                    <th className="px-4 py-2.5 font-medium">Klient</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Kwota</th>
                  </tr>
                </thead>
                <tbody>
                  {m.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-czarny/5 last:border-0 hover:bg-krem/40">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/admin/zamowienia/${order.id}`}
                          className="font-medium text-czerwony underline-offset-2 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-czarny/75">{order.customerName}</td>
                      <td className="px-4 py-2.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-heading text-xs">
                        {formatPLN(order.totalAmountInCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminPanel>

        <div className="space-y-4">
          <AdminPanel title="Kolejka statusów" description="Pipeline jak w Woo">
            <ul className="space-y-2">
              {PIPELINE.map((status) => {
                const count = m.statusCounts[status] ?? 0;
                return (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <span className="text-czarny/65">{ORDER_STATUS_LABELS[status]}</span>
                    <span className="font-heading text-xs tabular-nums text-czarny">{count}</span>
                  </li>
                );
              })}
            </ul>
          </AdminPanel>

          <AdminPanel
            title="Alerty magazynu"
            action={{ href: "/admin/produkty", label: "Magazyn" }}
            bodyClassName="p-0"
          >
            {m.lowStockProducts.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-czarny/45">Wszystkie warianty powyżej progu.</p>
            ) : (
              <ul className="divide-y divide-czarny/5">
                {m.lowStockProducts.slice(0, 5).map((product) => {
                  const stock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/admin/produkty/${product.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-krem/50"
                      >
                        <span className="truncate text-czarny/80">{product.name}</span>
                        <span className="shrink-0 font-heading text-[11px] text-czerwony">{stock} szt.</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminPanel>

          {m.tightWorkshops.length > 0 ? (
            <AdminPanel title="Warsztaty — mało miejsc" action={{ href: "/admin/warsztaty", label: "Terminy" }}>
              <ul className="space-y-2 text-sm">
                {m.tightWorkshops.map((workshop) => (
                  <li key={workshop.id} className="flex justify-between gap-2">
                    <span className="truncate text-czarny/75">{workshop.title}</span>
                    <span className="shrink-0 text-xs text-czerwony">
                      {remainingSeats(workshop)} miejsc
                    </span>
                  </li>
                ))}
              </ul>
            </AdminPanel>
          ) : null}

          <AdminPanel title="Szybkie linki">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <QuickLink href="/admin/produkty/nowy" label="Nowy produkt" />
              <QuickLink href="/admin/ustawienia-sklepu" label="Banner / urlop" />
              <QuickLink href="/admin/b2b" label={`B2B (${m.b2bCount})`} />
              <QuickLink href="/admin/analityka" label="Eksport CSV" />
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-czarny/8 bg-krem/50 px-3 py-2.5 font-medium text-czarny/75 transition hover:border-czerwony/25 hover:bg-bialy hover:text-czerwony"
    >
      {label}
    </Link>
  );
}
