"use client";

import { useState } from "react";
import { CheckoutField } from "@/components/checkout/checkout-field";

export function CheckoutCompany() {
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
          <span className="block font-medium text-czarny">Chcę fakturę na firmę</span>
          <span className="mt-1 block text-xs text-czarny/50">NIP i nazwa firmy na potwierdzeniu i w panelu pracowni.</span>
        </span>
      </label>
      <input type="hidden" name="isCompany" value={open ? "true" : "false"} />
      {open ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <CheckoutField name="companyName" label="Nazwa firmy / Company" autoComplete="organization" />
          <CheckoutField name="nip" label="NIP / VAT" placeholder="5833536856" autoComplete="off" />
        </div>
      ) : (
        <input type="hidden" name="nip" value="" />
      )}
    </div>
  );
}
