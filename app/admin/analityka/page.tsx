import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getAnalyticsSnapshot } from "@/lib/data/admin-analytics";
import { getPublishedProducts } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import { Banknote, Clock, ShoppingBag, TrendingUp } from "lucide-react";

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AnalyticsPage() {
  const snap = await getAnalyticsSnapshot();
  const products = getPublishedProducts();
  const maxDay = Math.max(1, ...snap.daily.map((d) => d.totalInCents));

  const csv = [["sku", "nazwa", "cena_grosze", "stan"].join(",")]
    .concat(
      products.flatMap((product) =>
        product.variants.map((variant) =>
          [
            variant.sku,
            `"${product.name.replaceAll('"', '""')}"`,
            variant.priceInCents ?? product.priceInCents,
            variant.stockQuantity,
          ].join(","),
        ),
      ),
    )
    .join("\n");

  const salesCsv = [
    ["numer", "data", "kwota_grosze", "metoda", "status"].join(","),
    ...snap.recentPaid.map((row) =>
      [row.orderNumber, row.createdAt, row.totalInCents, `"${row.method}"`, row.status].join(","),
    ),
  ].join("\n");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Zarobki i płatności"
        description="Przychód z opłaconych zamówień oraz jak klienci płacili (BLIK, karta, przelew…)."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Zarobione (opłacone)"
          value={formatPLN(snap.paidRevenueInCents)}
          hint={
            snap.paidOrderCount
              ? `${snap.paidOrderCount} zamówień · AOV ${formatPLN(snap.aovInCents)}`
              : "Brak opłaconych zamówień"
          }
          icon={Banknote}
        />
        <AdminStatCard
          label="Ostatnie 7 dni"
          value={formatPLN(snap.last7RevenueInCents)}
          hint={`30 dni: ${formatPLN(snap.last30RevenueInCents)}`}
          icon={TrendingUp}
        />
        <AdminStatCard
          label="Czeka na płatność"
          value={formatPLN(snap.pendingInCents)}
          hint={`${snap.pendingCount} zamówień pending`}
          href="/admin/zamowienia"
          icon={Clock}
        />
        <AdminStatCard
          label="Wszystkie zamówienia"
          value={String(snap.allOrderCount)}
          hint={snap.cancelledCount ? `${snap.cancelledCount} anulowanych` : "Bez anulacji"}
          href="/admin/zamowienia"
          icon={ShoppingBag}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel
          title="Jak zapłacili"
          description="Podział według metody z Przelewy24 (BLIK, karta, przelew…). „Oczekuje” = jeszcze nieopłacone."
        >
          {snap.byMethod.length === 0 ? (
            <p className="text-xs text-czarny/45">Brak zamówień — po pierwszej płatności pojawią się tu metody.</p>
          ) : (
            <ul className="space-y-3">
              {snap.byMethod.map((row) => (
                <li key={row.bucket} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-czarny">{row.bucket}</span>
                    <span className="shrink-0 font-heading text-xs text-czarny/70">
                      {row.totalInCents > 0 ? formatPLN(row.totalInCents) : "—"} · {row.orderCount} szt.
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-czarny/6">
                    <div
                      className="h-full rounded-full bg-czerwony/80"
                      style={{
                        width: `${Math.max(row.share > 0 ? row.share * 100 : row.orderCount ? 4 : 0, 0)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title="Ostatnie 14 dni" description="Słupki z opłaconych zamówień (dzień po dniu).">
          <div className="flex h-40 items-end gap-1.5">
            {snap.daily.map((day) => {
              const h = Math.round((day.totalInCents / maxDay) * 100);
              return (
                <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-czerwony/75 transition-all"
                    style={{ height: `${Math.max(h, day.totalInCents ? 6 : 2)}%` }}
                    title={`${day.label}: ${formatPLN(day.totalInCents)} (${day.orderCount})`}
                  />
                  <span className="truncate text-[9px] text-czarny/40">{day.label}</span>
                </div>
              );
            })}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel
        title="Ostatnie opłacone"
        description="Kliknij numer, żeby zobaczyć szczegóły i metodę płatności."
        bodyClassName="p-0"
      >
        {snap.recentPaid.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-czarny/45">
            Jeszcze brak opłaconych zamówień. Po BLIK / karcie / przelewie pojawią się tutaj.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-czarny/8 text-[11px] uppercase tracking-[0.12em] text-czarny/45">
                  <th className="px-5 py-3 font-medium">Numer</th>
                  <th className="px-3 py-3 font-medium">Kiedy</th>
                  <th className="px-3 py-3 font-medium">Metoda</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Kwota</th>
                </tr>
              </thead>
              <tbody>
                {snap.recentPaid.map((row) => (
                  <tr key={row.id} className="border-b border-czarny/6 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/zamowienia/${row.id}`}
                        className="font-medium text-czerwony underline-offset-2 hover:underline"
                      >
                        {row.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-czarny/65">{formatDay(row.createdAt)}</td>
                    <td className="px-3 py-3 font-medium">{row.method}</td>
                    <td className="px-3 py-3 text-czarny/55">{ORDER_STATUS_LABELS[row.status]}</td>
                    <td className="px-5 py-3 text-right font-heading">{formatPLN(row.totalInCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminPanel title="Eksport sprzedaży">
          <p className="mb-4 text-xs leading-relaxed text-czarny/55">
            CSV z ostatnimi opłaconymi zamówieniami (numer, data, kwota, metoda).
          </p>
          <a
            className="inline-flex rounded-lg bg-czarny px-4 py-2.5 text-xs font-medium text-bialy transition hover:bg-czerwony"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(salesCsv)}`}
            download="trzywiatry-sprzedaz.csv"
          >
            Pobierz CSV sprzedaży
          </a>
        </AdminPanel>
        <AdminPanel title="Eksport magazynu">
          <p className="mb-4 text-xs leading-relaxed text-czarny/55">
            CSV ze SKU, nazwą, ceną w groszach i stanem — do Excela lub księgowości.
          </p>
          <a
            className="inline-flex rounded-lg border border-czarny/12 bg-bialy px-4 py-2.5 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="trzywiatry-magazyn.csv"
          >
            Pobierz CSV magazynu
          </a>
        </AdminPanel>
      </div>
    </div>
  );
}
