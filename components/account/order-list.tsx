import Link from "next/link";
import { AccountTile, AccountTileBody, AccountTileHeader } from "@/components/account/account-tile";
import { OrderCard } from "@/components/account/order-card";
import type { StoredOrder } from "@/lib/types";

export function OrderList({
  title,
  eyebrow = "Zamówienia",
  empty,
  emptyHint,
  emptyHref,
  emptyCta,
  orders,
}: {
  title: string;
  eyebrow?: string;
  empty: string;
  emptyHint?: string;
  emptyHref?: string;
  emptyCta?: string;
  orders: StoredOrder[];
}) {
  return (
    <AccountTile>
      <AccountTileHeader
        eyebrow={eyebrow}
        title={title}
        end={
          <span className="font-heading text-[13px] tabular-nums tracking-wide text-czarny/40">
            {orders.length}
          </span>
        }
      />
      <AccountTileBody>
        {orders.length === 0 ? (
          <div>
            <p className="text-[14px] leading-relaxed text-czarny/65">{empty}</p>
            {emptyHint ? (
              <p className="mt-1.5 text-[13px] leading-relaxed text-czarny/45">{emptyHint}</p>
            ) : null}
            {emptyHref && emptyCta ? (
              <Link
                href={emptyHref}
                className="mt-3 inline-flex font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
              >
                {emptyCta}
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </AccountTileBody>
    </AccountTile>
  );
}
