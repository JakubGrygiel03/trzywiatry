"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountTile, AccountTileBody, AccountTileHeader } from "@/components/account/account-tile";
import { OrderStatusChip } from "@/components/account/order-status-chip";
import { ORDER_PIPELINE, ORDER_STATUS_HINTS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPLN } from "@/lib/format";
import type { OrderStatus, StoredOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

function pipelineIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return ORDER_PIPELINE.indexOf(status);
}

function OrderPipeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-2xl bg-krem px-3.5 py-3 text-[13px] text-czarny/65">{ORDER_STATUS_HINTS.cancelled}</p>
    );
  }

  const current = pipelineIndex(status);

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {ORDER_PIPELINE.map((step, index) => {
          const done = current > index;
          const active = current === index;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3.5 py-2.5",
                active && "border-czerwony bg-czerwony text-bialy",
                done && !active && "border-czerwony/35 bg-czerwony/10 text-czerwony",
                !done && !active && "border-czarny/10 bg-krem/30 text-czarny/35",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-heading text-[11px] tabular-nums",
                  active && "bg-bialy/20 text-bialy",
                  done && !active && "bg-czerwony/15 text-czerwony",
                  !done && !active && "bg-bialy text-czarny/30",
                )}
              >
                {done ? "✓" : String(index + 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[12px] uppercase tracking-[0.12em]">
                  {ORDER_STATUS_LABELS[step]}
                </span>
                {active ? (
                  <span className="mt-0.5 block text-[12px] leading-snug text-bialy/85">
                    {ORDER_STATUS_HINTS[step]}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OrderItems({ order }: { order: StoredOrder }) {
  return (
    <ul className="divide-y divide-czarny/8 overflow-hidden rounded-2xl border border-czarny/8">
      {order.items.map((item) => (
        <li
          key={`${item.variantId}-${item.productId}`}
          className="flex items-start justify-between gap-3 px-3.5 py-3 text-[13px]"
        >
          <span className="min-w-0">
            <span className="block font-medium text-czarny">{item.productName}</span>
            <span className="mt-0.5 block text-czarny/45">
              {item.variantTitle} · ×{item.quantity}
            </span>
          </span>
          <span className="shrink-0 tabular-nums text-czarny/70">
            {formatPLN(item.unitPriceInCents * item.quantity)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ExpandableOrder({
  order,
  mode,
  defaultOpen = false,
}: {
  order: StoredOrder;
  mode: "open" | "history";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const summary = order.items.map((item) => `${item.productName} ×${item.quantity}`).join(" · ");

  return (
    <div className="overflow-hidden rounded-[22px] border border-czarny/10 bg-krem/20">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-krem/50 sm:px-5"
      >
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-[12px] uppercase tracking-[0.14em] text-czarny">
              {order.orderNumber}
            </span>
            <OrderStatusChip status={order.status} />
          </span>
          <span className="block text-[12px] text-czarny/45">{formatDate(order.createdAt)}</span>
          <span className="line-clamp-2 block text-[13px] text-czarny/65">{summary}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2">
          <span className="font-heading text-[13px] text-czerwony">{formatPLN(order.totalAmountInCents)}</span>
          <ChevronDown
            className={cn("size-4 text-czarny/40 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-czarny/8 bg-bialy px-4 py-4 sm:px-5">
          {mode === "open" ? (
            <>
              <div>
                <p className="mb-2 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                  Status realizacji
                </p>
                <OrderPipeline status={order.status} />
              </div>
              {order.trackingNumber ? (
                <p className="rounded-2xl bg-krem px-3.5 py-3 text-[13px]">
                  Numer śledzenia: <strong>{order.trackingNumber}</strong>
                </p>
              ) : null}
            </>
          ) : null}

          <div>
            <p className="mb-2 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
              {mode === "history" ? "Kupione produkty" : "Zawartość zamówienia"}
            </p>
            <OrderItems order={order} />
          </div>

          <Link
            href={`/konto/zamowienia/${order.id}`}
            className="inline-flex font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
          >
            Pełne szczegóły →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function OrdersSection({
  eyebrow,
  title,
  description,
  empty,
  emptyHint,
  emptyHref,
  emptyCta,
  orders,
  mode,
}: {
  eyebrow: string;
  title: string;
  description: string;
  empty: string;
  emptyHint: string;
  emptyHref: string;
  emptyCta: string;
  orders: StoredOrder[];
  mode: "open" | "history";
}) {
  return (
    <AccountTile>
      <AccountTileHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        end={
          <span className="font-heading text-[13px] tabular-nums tracking-wide text-czarny/40">
            {orders.length}
          </span>
        }
      />
      <AccountTileBody className="space-y-3">
        {orders.length === 0 ? (
          <div>
            <p className="text-[14px] leading-relaxed text-czarny/65">{empty}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-czarny/45">{emptyHint}</p>
            <Link
              href={emptyHref}
              className="mt-3 inline-flex font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
            >
              {emptyCta}
            </Link>
          </div>
        ) : (
          orders.map((order, index) => (
            <ExpandableOrder
              key={order.id}
              order={order}
              mode={mode}
              defaultOpen={mode === "open" && index === 0}
            />
          ))
        )}
      </AccountTileBody>
    </AccountTile>
  );
}

export function AccountOrdersPanels({
  open,
  history,
}: {
  open: StoredOrder[];
  history: StoredOrder[];
}) {
  return (
    <div className="grid gap-4 sm:gap-5">
      <OrdersSection
        eyebrow="Na bieżąco"
        title="W realizacji"
        description="Rozwiń zamówienie, żeby zobaczyć etap i zawartość paczki."
        empty="Nie masz teraz żadnego zamówienia w toku."
        emptyHint="Po złożeniu zamówienia zobaczysz tu kolejne etapy: płatność → pakowanie → wysyłka."
        emptyHref="/sklep"
        emptyCta="Zobacz sklep →"
        orders={open}
        mode="open"
      />
      <OrdersSection
        eyebrow="Archiwum"
        title="Historia zakupów"
        description="Rozwiń, żeby zobaczyć dokładnie, co kupiłeś."
        empty="Brak zakończonych zamówień."
        emptyHint="Tu pojawią się dostarczone i anulowane zamówienia z listą produktów."
        emptyHref="/dostawa-i-zwroty"
        emptyCta="Jak wysyłamy →"
        orders={history}
        mode="history"
      />
    </div>
  );
}
