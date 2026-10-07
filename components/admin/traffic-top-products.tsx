import Link from "next/link";
import { scoreProduct, type TrafficProductRow } from "@/lib/data/traffic-stats";

export function TrafficTopProducts({
  rows,
}: {
  rows: Array<{ slug: string; name: string; href: string; stats: TrafficProductRow }>;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-xs text-czarny/45">
        Jeszcze brak kliknięć. Po zgodzie na cookies lista wypełni się sama — najpierw te, które goście otwierają i
        dokładają do koszyka.
      </p>
    );
  }

  const max = Math.max(1, ...rows.map((row) => scoreProduct(row.stats)));

  return (
    <ul className="space-y-3">
      {rows.map((row, index) => {
        const width = Math.max(6, Math.round((scoreProduct(row.stats) / max) * 100));
        return (
          <li key={row.slug} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <Link href={row.href} className="min-w-0 truncate font-medium text-czarny hover:text-czerwony">
                <span className="mr-2 font-heading text-[11px] text-czarny/35">{index + 1}</span>
                {row.name}
              </Link>
              <span className="shrink-0 font-heading text-[11px] text-czarny/55">
                {row.stats.clicks} klik · {row.stats.views} karty · {row.stats.carts} koszyk
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-czarny/6">
              <div className="h-full rounded-full bg-czerwony/80" style={{ width: `${width}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
