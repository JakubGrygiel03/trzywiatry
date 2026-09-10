"use client";

import { useState } from "react";

export function RelatedProductsField({
  catalog,
  currentId,
  initialIds = [],
}: {
  catalog: { id: string; name: string }[];
  currentId?: string;
  initialIds?: string[];
}) {
  const options = catalog.filter((item) => item.id !== currentId);
  const [ids, setIds] = useState<string[]>(initialIds.filter((id) => id !== currentId));

  function toggle(id: string) {
    setIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="relatedIdsJson" value={JSON.stringify(ids)} />
      <p className="text-xs text-czarny/50">np. forma ucha przy formie czarki. Max 6.</p>
      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-czarny/10 bg-bialy p-2">
        {options.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-krem">
              <input
                type="checkbox"
                checked={ids.includes(item.id)}
                disabled={!ids.includes(item.id) && ids.length >= 6}
                onChange={() => toggle(item.id)}
                className="accent-czerwony"
              />
              {item.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
