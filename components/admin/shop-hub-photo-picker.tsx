"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CmsImagePicker } from "@/components/admin/cms-image-picker";
import type { HeroPhotoOption } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

function LanePicker({
  label,
  hint,
  name,
  options,
  selected,
  onSelect,
}: {
  label: string;
  hint: string;
  name: string;
  options: HeroPhotoOption[];
  selected: string;
  onSelect: (image: string) => void;
}) {
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

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={selected} />
      <div>
        <p className="text-sm font-medium text-czarny">{label}</p>
        <p className="text-xs text-czarny/45">{hint}</p>
      </div>
      <CmsImagePicker
        value={selected}
        onChange={onSelect}
        folder="cms"
        aspectClass="aspect-[4/3]"
        hint="Wgraj kadr z dysku albo weź go z biblioteki."
      />
      {grouped.length === 0 ? (
        <p className="text-sm text-czarny/55">Brak zdjęć na tej półce — dodaj je przy produktach albo wgraj powyżej.</p>
      ) : (
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          <p className="text-xs font-medium text-czarny/55">Z katalogu półki</p>
          {grouped.map((group) => (
            <div key={group.photos[0]!.productId}>
              <p className="mb-1.5 text-xs font-medium text-czarny/70">{group.name}</p>
              <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {group.photos.map((option) => {
                  const active = option.image === selected;
                  return (
                    <li key={option.image}>
                      <button
                        type="button"
                        onClick={() => onSelect(option.image)}
                        className={cn(
                          "relative aspect-square w-full overflow-hidden rounded-lg border bg-szary",
                          active ? "border-czerwony ring-2 ring-czerwony/30" : "border-szary",
                        )}
                        aria-pressed={active}
                        aria-label={`${option.name}${active ? ", wybrane" : ""}`}
                      >
                        <Image src={option.image} alt="" fill className="object-cover" sizes="80px" />
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

export function ShopHubPhotoPicker({
  uzytkowaOptions,
  pracowniaOptions,
  initialUzytkowa,
  initialPracownia,
}: {
  uzytkowaOptions: HeroPhotoOption[];
  pracowniaOptions: HeroPhotoOption[];
  initialUzytkowa: string;
  initialPracownia: string;
}) {
  const [uzytkowa, setUzytkowa] = useState(initialUzytkowa);
  const [pracownia, setPracownia] = useState(initialPracownia);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <LanePicker
        label="Ceramika użytkowa"
        hint="Kafelek „Dla domu”"
        name="shopHubUzytkowaImage"
        options={uzytkowaOptions}
        selected={uzytkowa}
        onSelect={setUzytkowa}
      />
      <LanePicker
        label="Dla pracowni"
        hint="Kafelek „Dla ceramików”"
        name="shopHubPracowniaImage"
        options={pracowniaOptions}
        selected={pracownia}
        onSelect={setPracownia}
      />
    </div>
  );
}
