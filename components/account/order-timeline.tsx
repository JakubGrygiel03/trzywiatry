import { ORDER_PIPELINE, ORDER_STATUS_HINTS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/format";
import type { OrderStatus, StoredOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

function pipelineIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return ORDER_PIPELINE.indexOf(status);
}

export function OrderTimeline({ order }: { order: StoredOrder }) {
  const current = pipelineIndex(order.status);
  const events = order.statusHistory?.length
    ? order.statusHistory
    : [{ status: order.status, at: order.updatedAt || order.createdAt }];

  return (
    <div className="space-y-5">
      {order.status === "cancelled" ? (
        <p className="rounded-xl bg-krem px-4 py-3 text-sm text-czarny/70">
          {ORDER_STATUS_HINTS.cancelled}
        </p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-5">
          {ORDER_PIPELINE.map((step, index) => {
            const done = current >= index;
            const active = current === index;
            return (
              <li
                key={step}
                className={cn(
                  "rounded-xl border px-2.5 py-2 text-center",
                  active && "border-czerwony bg-czerwony text-bialy",
                  done && !active && "border-czerwony/30 bg-czerwony/10 text-czerwony",
                  !done && "border-szary bg-bialy text-szary",
                )}
              >
                <p className="font-heading text-[9px] uppercase tracking-[0.12em]">
                  {ORDER_STATUS_LABELS[step]}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <p className="text-sm leading-relaxed text-czarny">{ORDER_STATUS_HINTS[order.status]}</p>

      <ol className="space-y-3 border-l border-szary pl-4">
        {[...events].reverse().map((event, index) => (
          <li key={`${event.status}-${event.at}-${index}`} className="space-y-0.5">
            <p className="font-heading text-[11px] uppercase tracking-[0.12em] text-czerwony">
              {ORDER_STATUS_LABELS[event.status]}
            </p>
            <p className="text-xs text-czarny/50">
              {formatDate(event.at)} · {formatTime(event.at)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
