import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER_TONES: Record<OrderStatus, string> = {
  pending: "bg-szary/25 text-czarny/70",
  paid: "bg-ceglany/20 text-czerwony",
  processing: "bg-czerwony/15 text-czerwony",
  shipped: "bg-czarny/8 text-czarny",
  completed: "bg-czarny text-bialy",
  cancelled: "bg-czarny/5 text-szary line-through",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        ORDER_TONES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        published ? "bg-czerwony/12 text-czerwony" : "bg-czarny/6 text-czarny/45",
      )}
    >
      {published ? "Opublikowany" : "Szkic"}
    </span>
  );
}
