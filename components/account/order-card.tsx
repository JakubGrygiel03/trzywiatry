import Link from "next/link";
import { OrderStatusChip } from "@/components/account/order-status-chip";
import { formatDate, formatPLN } from "@/lib/format";
import type { StoredOrder } from "@/lib/types";

export function OrderCard({ order }: { order: StoredOrder }) {
  const summary = order.items.map((item) => `${item.productName} × ${item.quantity}`).join(" · ");

  return (
    <li>
      <Link
        href={`/konto/zamowienia/${order.id}`}
        className="block rounded-2xl border border-szary bg-bialy px-4 py-4 transition-colors hover:border-czerwony/40"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-heading text-[11px] uppercase tracking-[0.14em] text-czarny">
            {order.orderNumber}
          </p>
          <OrderStatusChip status={order.status} />
        </div>
        <p className="mt-2 text-sm text-czarny/55">{formatDate(order.createdAt)}</p>
        <p className="mt-1 text-sm font-medium text-czarny">{formatPLN(order.totalAmountInCents)}</p>
        <p className="mt-1 line-clamp-2 text-xs text-czarny/45">{summary}</p>
      </Link>
    </li>
  );
}
