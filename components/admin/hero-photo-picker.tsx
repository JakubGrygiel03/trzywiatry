"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { HeroPhotoOption } from "@/lib/data/queries";
import type { HeroSlot } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_SLOTS = 12;

function slotKey(slot: HeroSlot) {
  return `${slot.productId}|${slot.image}`;
}

export function HeroPhotoPicker({
  options,
  initialSlots,
  onChange,
  hideInput,
}: {
  options: HeroPhotoOption[];
  initialSlots: HeroSlot[];
  onChange?: (slots: HeroSlot[]) => void;
  hideInput?: boolean;
}) {
  const [slots, setSlots] = useState<HeroSlot[]>(initialSlots);

  function commit(next: HeroSlot[]) {
    setSlots(next);
    onChange?.(next);
  }

  const grouped = useMemo(() => {
    const map = new Map<string, HeroPhotoOption[]>();
    for (const option of options) {
      const list = map.get(option.productId) ?? [];
      list.push(option);
      map.set(option.productId, list);
    }
    return [...map.entries()].map(([, photos]) => ({
      name: photos[0]!.name,
      photos,
    }));
  }, [options]);

  function toggle(option: HeroPhotoOption) {
    const key = slotKey(option);
    const index = slots.findIndex((slot) => slotKey(slot) === key);
    if (index >= 0) {
      commit(slots.filter((_, i) => i !== index));
      return;
    }
    if (slots.length >= MAX_SLOTS) return;
    commit([...slots, { productId: option.productId, image: option.image }]);
  }

  return (
    <div className="space-y-4">
      {hideInput ? null : <input type="hidden" name="heroSlots" value={JSON.stringify(slots)} />}
      <p className="text-sm text-czarny">
        Zaznaczone: <strong>{slots.length}</strong> / {MAX_SLOTS}. Pierwsze trzy kadry stoją od lewej. Kolejne
        wchodzą w rotację.
      </p>

      {grouped.length === 0 ? (
        <p className="text-sm text-czarny">Brak zdjęć w katalogu — najpierw dodaj je przy produktach.</p>
      ) : (
        <div className="max-h-[28rem] space-y-5 overflow-y-auto pr-1">
          {grouped.map((group) => (
            <div key={group.photos[0]!.productId}>
              <p className="mb-2 text-xs font-medium text-czarny">{group.name}</p>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {group.photos.map((option) => {
                  const order = slots.findIndex((slot) => slotKey(slot) === slotKey(option));
                  const selected = order >= 0;
                  return (
                    <li key={option.image}>
                      <button
                        type="button"
                        onClick={() => toggle(option)}
                        className={cn(
                          "relative aspect-square w-full overflow-hidden rounded-lg border bg-szary",
                          selected ? "border-czerwony ring-2 ring-czerwony/30" : "border-szary",
                        )}
                        aria-pressed={selected}
                        aria-label={`${option.name}, zdjęcie ${selected ? order + 1 : "dodaj do hero"}`}
                      >
                        <Image src={option.image} alt="" fill className="object-cover" sizes="120px" />
                        {selected ? (
                          <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-czerwony px-1 font-heading text-[10px] text-bialy">
                            {order + 1}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
