"use client";

import { deleteOrder } from "@/app/actions/admin-orders";

export function DeleteOrderButton({
  id,
  orderNumber,
  compact = false,
}: {
  id: string;
  orderNumber: string;
  compact?: boolean;
}) {
  return (
    <form
      action={deleteOrder}
      onSubmit={(event) => {
        if (!window.confirm(`Usunąć zamówienie ${orderNumber}? Magazyn wróci, jeśli nie było anulowane.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={
          compact
            ? "text-xs font-medium text-czerwony/80 underline-offset-2 hover:underline"
            : "rounded-lg border border-czerwony/30 px-3.5 py-2 text-xs font-medium text-czerwony transition hover:bg-czerwony/5"
        }
      >
        Usuń
      </button>
    </form>
  );
}
