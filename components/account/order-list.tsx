import { OrderCard } from "@/components/account/order-card";
import type { StoredOrder } from "@/lib/types";

export function OrderList({
  title,
  empty,
  orders,
}: {
  title: string;
  empty: string;
  orders: StoredOrder[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-sm uppercase tracking-[0.14em]">{title}</h2>
      {orders.length === 0 ? (
        <p className="rounded-2xl border border-szary bg-bialy px-4 py-4 text-sm text-czarny/55">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </section>
  );
}
