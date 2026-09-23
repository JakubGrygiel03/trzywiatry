"use client";

import { useActionState, useEffect } from "react";
import { startPendingOrderPayment, type PayOrderState } from "@/app/actions/pay-order";
import { P24HandoffNotice } from "@/components/checkout/p24-handoff-notice";
import { Button } from "@/components/ui/button";
import { beginP24Handoff, endP24Handoff, goToP24 } from "@/lib/p24-handoff";

const initial: PayOrderState = { ok: false };

export function PayP24Button({
  orderNumber,
  orderId,
  label,
}: {
  orderNumber: string;
  orderId: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(startPendingOrderPayment, initial);

  useEffect(() => {
    if (!state.ok || !state.redirectTo) return;
    goToP24(state.redirectTo);
  }, [state.ok, state.redirectTo]);

  useEffect(() => {
    if (!state.ok && state.message) endP24Handoff();
  }, [state.ok, state.message]);

  if (pending || state.ok) {
    return <P24HandoffNotice compact />;
  }

  return (
    <form
      action={action}
      className="pt-1"
      onSubmit={() => {
        beginP24Handoff();
      }}
    >
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="orderId" value={orderId} />
      <Button type="submit">{label}</Button>
      {state.message ? <p className="mt-2 text-sm text-czerwony">{state.message}</p> : null}
    </form>
  );
}
