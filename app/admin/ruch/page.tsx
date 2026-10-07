import { Eye, MousePointerClick, ShoppingBag, TrendingUp } from "lucide-react";
import { clearTrafficStats } from "@/app/actions/admin-traffic";
import { TrafficTopProducts } from "@/components/admin/traffic-top-products";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminDayBars } from "@/components/admin/ui/admin-day-bars";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card";
import { getPublishedProducts } from "@/lib/data/queries";
import { getTrafficSnapshot } from "@/lib/data/traffic-persist";
import { dayKey, scoreProduct } from "@/lib/data/traffic-stats";

const PATH_LABELS: Record<string, string> = {
  "/": "Strona główna",
  "/sklep": "Sklep (lista)",
  "/sklep/:produkt": "Karty produktów",
  "/warsztaty": "Warsztaty",
  "/o-nas": "O nas",
  "/blog": "Blog",
  "/b2b": "B2B",
  "/kontakt": "Kontakt",
  "/kolekcje": "Kolekcje",
  "/inne": "Inne podstrony",
};

function lastDays(days: Record<string, number>, count: number) {
  const keys: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(dayKey(d));
  }
  return keys.map((key) => ({
    key,
    label: key.slice(5).replace("-", "."),
    value: days[key] ?? 0,
  }));
}

export default async function TrafficPage({
  searchParams,
}: {
  searchParams: Promise<{ wyczyszczono?: string }>;
}) {
  const { wyczyszczono } = await searchParams;
  const snap = await getTrafficSnapshot();
  const products = getPublishedProducts();
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const today = snap.days[dayKey()] ?? 0;
  const week = lastDays(snap.days, 7).reduce((sum, day) => sum + day.value, 0);
  const chart = lastDays(snap.days, 14);

  const productEntries = Object.entries(snap.products);
  const clickTotal = productEntries.reduce((sum, [, row]) => sum + row.clicks, 0);
  const cartTotal = productEntries.reduce((sum, [, row]) => sum + row.carts, 0);
  const topProducts = productEntries
    .sort((a, b) => scoreProduct(b[1]) - scoreProduct(a[1]))
    .slice(0, 12)
    .map(([slug, stats]) => ({
      slug,
      name: bySlug.get(slug)?.name ?? slug,
      href: `/sklep/${slug}`,
      stats,
    }));

  const topPaths = Object.entries(snap.paths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Ruch na stronie"
        description="Odsłony i najchętniej otwierane naczynia — z Instagrama i z wyszukiwarki. Liczymy po zgodzie na cookies, bez nazwisk i bez piksela Meta."
        actions={
          <form action={clearTrafficStats}>
            <button
              type="submit"
              className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny/70 transition hover:border-czerwony/30"
            >
              Wyczyść liczniki
            </button>
          </form>
        }
      />

      {wyczyszczono ? <AdminAlert variant="success">Liczniki wyzerowane.</AdminAlert> : null}

      <AdminAlert>
        Adres <span className="font-medium">trzywiatry.vercel.app</span> jest wyłączony: każde wejście ląduje na
        trzywiatry.pl. Stary wynik w Google zniknie sam, zwykle w ciągu kilku dni.
      </AdminAlert>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Odsłony dziś" value={String(today)} hint="Po akceptacji cookies" icon={Eye} />
        <AdminStatCard label="Ostatnie 7 dni" value={String(week)} hint={`${snap.pageViews} łącznie`} icon={TrendingUp} />
        <AdminStatCard
          label="Kliknięcia produktów"
          value={String(clickTotal)}
          hint="Kafelki w sklepie i na głównej"
          icon={MousePointerClick}
        />
        <AdminStatCard
          label="Do koszyka"
          value={String(cartTotal)}
          hint="Sygnał zainteresowania, nie sprzedaż"
          icon={ShoppingBag}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Najpopularniejsze produkty" description="Kolejność: koszyk ×5, klik ×3, otwarcie karty ×1.">
          <TrafficTopProducts rows={topProducts} />
        </AdminPanel>
        <AdminPanel title="Gdzie wchodzą" description="Odsłony podstron (nie unikalne osoby).">
          {topPaths.length === 0 ? (
            <p className="text-xs text-czarny/45">Brak danych — poczekaj na pierwsze wizyty ze zgodą.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topPaths.map(([path, count]) => (
                <li key={path} className="flex justify-between gap-3">
                  <span>{PATH_LABELS[path] ?? path}</span>
                  <span className="font-heading text-czarny/60">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <AdminPanel title="Ostatnie 14 dni" description="Odsłony dzień po dniu.">
        <AdminDayBars days={chart} />
      </AdminPanel>
    </div>
  );
}
