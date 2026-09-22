"use client";

import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from "lucide-react";
import { CmsImagePicker } from "@/components/admin/cms-image-picker";
import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import type { GalleryWork } from "@/lib/data/gallery";
import { MAX_ABOUT_GALLERY_WORKS } from "@/lib/data/gallery";

export function AboutGalleryEditor({
  works,
  onChange,
}: {
  works: GalleryWork[];
  onChange: (next: GalleryWork[]) => void;
}) {
  function patch(index: number, partial: Partial<GalleryWork>) {
    onChange(works.map((work, i) => (i === index ? { ...work, ...partial } : work)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= works.length) return;
    const next = [...works];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function remove(index: number) {
    if (works.length <= 1) return;
    onChange(works.filter((_, i) => i !== index));
  }

  function addBlank() {
    if (works.length >= MAX_ABOUT_GALLERY_WORKS) return;
    onChange([...works, { src: works[0]?.src ?? "", alt: "Praca z pracowni" }]);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-czarny/45">
        Kolejność = kolejność w galerii na /o-nas. Możesz wgrać własne kadry albo wziąć zdjęcie z biblioteki.
      </p>
      <ul className="space-y-4">
        {works.map((work, index) => (
          <li key={`${work.src}-${index}`} className="rounded-xl border border-czarny/8 bg-krem/30 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-czarny/70">Zdjęcie {index + 1}</p>
              <div className="flex gap-1">
                <button type="button" aria-label="Wyżej" onClick={() => move(index, -1)} className="rounded p-1 text-czarny/40 hover:text-czarny">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Niżej" onClick={() => move(index, 1)} className="rounded p-1 text-czarny/40 hover:text-czarny">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Usuń"
                  disabled={works.length <= 1}
                  onClick={() => remove(index)}
                  className="rounded p-1 text-czerwony disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CmsImagePicker
              value={work.src}
              onChange={(src) => patch(index, { src })}
              folder="gallery"
              aspectClass="aspect-square"
              hint="Wgraj kadr albo wybierz z biblioteki (także zdjęcia produktów)."
            />
            <AdminField className="mt-3" label="Opis zdjęcia" htmlFor={`gallery-alt-${index}`} required>
              <AdminInput
                id={`gallery-alt-${index}`}
                value={work.alt}
                onChange={(e) => patch(index, { alt: e.target.value })}
              />
            </AdminField>
          </li>
        ))}
      </ul>
      {works.length < MAX_ABOUT_GALLERY_WORKS ? (
        <button
          type="button"
          onClick={addBlank}
          className="inline-flex items-center gap-2 text-sm text-czerwony underline-offset-2 hover:underline"
        >
          <ImagePlus className="h-4 w-4" />
          Dodaj zdjęcie do galerii
        </button>
      ) : null}
    </div>
  );
}
