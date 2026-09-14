import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { OrderStatusChip } from "@/components/account/order-status-chip";
import { formatDate, formatPLN } from "@/lib/format";
import type { StoredOrder } from "@/lib/types";

export function OrderCard({ order }: { order: StoredOrder }) {
  const summary = order.items.map((item) => `${item.productName} × ${item.quantity}`).join(" · ");

  return (
    <li>
      <Link
        href={`/konto/zamowienia/${order.id}`}
        className="group flex items-stretch gap-3 rounded-[22px] border border-czarny/8 bg-bialy p-4 shadow-[0_12px_36px_-28px_rgb(1_1_1_/_0.45)] transition-colors hover:border-czerwony/35 hover:bg-krem/30 sm:gap-4 sm:p-5"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-[12px] uppercase tracking-[0.14em] text-czarny">
              {order.orderNumber}
            </p>
            <OrderStatusChip status={order.status} />
          </div>
          <p className="text-[13px] text-czarny/50">{formatDate(order.createdAt)}</p>
          <p className="line-clamp-2 text-[13px] leading-snug text-czarny/65">{summary}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between gap-3">
          <p className="font-heading text-[14px] tracking-wide text-czerwony">
            {formatPLN(order.totalAmountInCents)}
          </p>
          <ChevronRight
            className="size-4 text-czarny/25 transition-colors group-hover:text-czerwony"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </Link>
    </li>
  );
}
