"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminInput, AdminSelect } from "@/components/admin/ui/admin-field";
import { SHOP_CATEGORY_TREE } from "@/lib/constants";

export function ProductListFilters({
  initialQ = "",
  initialCategory = "",
}: {
  initialQ?: string;
  initialCategory?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams();
      if (q.trim()) next.set("q", q.trim());
      if (category) next.set("kategoria", category);
      const query = next.toString();
      router.replace(query ? `/admin/produkty?${query}` : "/admin/produkty");
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q, category, router]);

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-czarny/60">Szukaj po nazwie</span>
        <AdminInput
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Np. czarka, micha, SKU…"
          aria-label="Szukaj produktu po nazwie"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-czarny/60">Kategoria</span>
        <AdminSelect
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtruj po kategorii"
        >
          <option value="">Wszystkie kategorie</option>
          {SHOP_CATEGORY_TREE.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {group.children.map((child) => (
                <option key={child.id} value={child.category}>
                  {child.label}
                </option>
              ))}
            </optgroup>
          ))}
        </AdminSelect>
      </label>
    </div>
  );
}
