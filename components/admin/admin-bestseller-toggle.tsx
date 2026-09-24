"use client";

import { useOptimistic, useTransition } from "react";
import { updateProductBestseller } from "@/app/actions/admin-products";

/** Inline bestseller flag on the admin products list — saves on click. */
export function AdminBestsellerToggle({
  productId,
  isBestseller,
}: {
  productId: string;
  isBestseller: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useOptimistic(isBestseller);

  function save(next: boolean) {
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("isBestseller", next ? "true" : "false");
    startTransition(async () => {
      setChecked(next);
      await updateProductBestseller(formData);
    });
  }

  return (
    <label
      className={`flex cursor-pointer items-center gap-1.5 text-[11px] ${pending ? "opacity-50" : ""} ${
        checked ? "font-medium text-ceglany" : "text-czarny/65"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(event) => save(event.target.checked)}
        className="accent-czerwony"
      />
      Bestseller
    </label>
  );
}
