import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONES: Record<OrderStatus, string> = {
  pending: "border-szary bg-bialy text-czarny/70",
  paid: "border-ceglany/50 bg-ceglany/10 text-czerwony",
  processing: "border-czerwony/40 bg-czerwony/10 text-czerwony",
  shipped: "border-czarny/20 bg-krem text-czarny",
  completed: "border-czarny bg-czarny text-bialy",
  cancelled: "border-szary bg-krem text-szary line-through",
};

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 font-heading text-[10px] uppercase tracking-[0.14em]",
        TONES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
