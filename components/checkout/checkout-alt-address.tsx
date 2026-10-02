"use client";

import { useState } from "react";
import { CheckoutField } from "@/components/checkout/checkout-field";

export function CheckoutAltAddress() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4 rounded-2xl border border-czarny/8 bg-krem/40 px-4 py-4">
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={open}
          onChange={(event) => setOpen(event.target.checked)}
          className="mt-0.5 accent-czerwony"
        />
        <span>
          <span className="block font-medium text-czarny">Inny adres wysyłki</span>
          <span className="mt-1 block text-xs text-czarny/50">
            Paczka kurierem na inny adres niż dane do faktury.
          </span>
        </span>
      </label>
      <input type="hidden" name="shipToDifferent" value={open ? "true" : "false"} />
      {open ? (
        <div className="space-y-5">
          <CheckoutField name="shippingStreet" label="Ulica i numer dostawy" />
          <div className="grid gap-5 sm:grid-cols-2">
            <CheckoutField name="shippingPostalCode" label="Kod pocztowy dostawy" placeholder="80-000" />
            <CheckoutField name="shippingCity" label="Miasto dostawy" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
