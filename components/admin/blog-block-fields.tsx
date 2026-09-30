"use client";

import { List, ListOrdered, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import type { BlogBlockInput } from "@/lib/validations/blog";
import { cn } from "@/lib/utils";

export function ImagePreview({ src, label }: { src?: string; label?: string }) {
  if (!src) return null;
  return (
    // Native img — CMS previews include blob: and storage URLs Next/Image often blanks.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={label || ""} className="h-full w-full object-contain" />
  );
}

export function ImageBlockEditor({
  block,
  uploading,
  onUpload,
  onChange,
}: {
  block: Extract<BlogBlockInput, { type: "image" }>;
  uploading: boolean;
  onUpload: (file: File) => void;
  onChange: (block: Extract<BlogBlockInput, { type: "image" }>) => void;
}) {
  const [localSrc, setLocalSrc] = useState("");
  const preview = block.src || localSrc;

  useEffect(() => {
    if (block.src && localSrc) {
      URL.revokeObjectURL(localSrc);
      setLocalSrc("");
    }
  }, [block.src, localSrc]);

  function pick(file: File) {
    const url = URL.createObjectURL(file);
    setLocalSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    onUpload(file);
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-lg border border-czarny/10 bg-bialy">
          <ImagePreview src={preview} label={block.alt} />
          {uploading ? (
            <p className="absolute inset-x-0 bottom-0 bg-czarny/70 py-1 text-center text-[11px] text-bialy">
              Wgrywam…
            </p>
          ) : null}
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-czarny/15 bg-bialy py-10 text-sm text-czarny/50",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? "Wgrywam…" : "Wybierz zdjęcie"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pick(file);
            }}
          />
        </label>
      )}
      <AdminField label="Opis zdjęcia (alt)" hint="Krótki opis dla czytników ekranu i SEO.">
        <AdminInput
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Co widać na zdjęciu"
        />
      </AdminField>
      <AdminField label="Podpis pod zdjęciem" hint="Opcjonalny — wyświetli się kursywą pod fotografią.">
        <AdminInput
          value={block.caption ?? ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="np. pierwsze szkice logo"
        />
      </AdminField>
      {preview ? (
        <button
          type="button"
          className="text-xs text-czerwony underline-offset-2 hover:underline"
          onClick={() => {
            if (localSrc) URL.revokeObjectURL(localSrc);
            setLocalSrc("");
            onChange({ type: "image", src: "", alt: "", caption: "" });
          }}
        >
          Zamień zdjęcie
        </button>
      ) : null}
    </div>
  );
}

export function ImageRowSlot({
  image,
  uploading,
  onUpload,
  onAltChange,
}: {
  image: { src: string; alt: string; caption?: string };
  uploading: boolean;
  onUpload: (file: File) => void;
  onAltChange: (alt: string) => void;
}) {
  const [localSrc, setLocalSrc] = useState("");
  const preview = image.src || localSrc;

  useEffect(() => {
    if (image.src && localSrc) {
      URL.revokeObjectURL(localSrc);
      setLocalSrc("");
    }
  }, [image.src, localSrc]);

  return (
    <div className="space-y-2 rounded-lg border border-czarny/8 bg-bialy p-3">
      {preview ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-krem">
          <ImagePreview src={preview} label={image.alt} />
          {uploading ? (
            <p className="absolute inset-x-0 bottom-0 bg-czarny/70 py-1 text-center text-[11px] text-bialy">
              Wgrywam…
            </p>
          ) : null}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-czarny/15 py-8 text-xs text-czarny/50">
          {uploading ? "Wgrywam…" : "Wybierz zdjęcie"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setLocalSrc((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
              });
              onUpload(file);
            }}
          />
        </label>
      )}
      <AdminInput value={image.alt} onChange={(e) => onAltChange(e.target.value)} placeholder="Opis (alt)" />
    </div>
  );
}

export function ListBlockEditor({
  items,
  ordered,
  onChange,
}: {
  items: string[];
  ordered?: boolean;
  onChange: (items: string[], ordered: boolean) => void;
}) {
  const isOrdered = Boolean(ordered);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(items, false)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
            !isOrdered ? "border-czerwony/40 bg-czerwony/5 text-czerwony" : "border-czarny/12 text-czarny/55",
          )}
        >
          <List className="h-3.5 w-3.5" />
          Punktowana
        </button>
        <button
          type="button"
          onClick={() => onChange(items, true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
            isOrdered ? "border-czerwony/40 bg-czerwony/5 text-czerwony" : "border-czarny/12 text-czarny/55",
          )}
        >
          <ListOrdered className="h-3.5 w-3.5" />
          Numerowana
        </button>
      </div>
      {items.map((listItem, listIndex) => (
        <div key={listIndex} className="flex gap-2">
          <span className="flex h-11 w-7 shrink-0 items-center justify-center text-xs text-czarny/40">
            {isOrdered ? `${listIndex + 1}.` : "•"}
          </span>
          <AdminInput
            value={listItem}
            onChange={(e) => {
              const itemsCopy = [...items];
              itemsCopy[listIndex] = e.target.value;
              onChange(itemsCopy, isOrdered);
            }}
            placeholder={isOrdered ? `Punkt ${listIndex + 1}` : `Punkt ${listIndex + 1}`}
          />
          <button
            type="button"
            onClick={() => {
              const itemsCopy = items.filter((_, i) => i !== listIndex);
              onChange(itemsCopy.length ? itemsCopy : [""], isOrdered);
            }}
            className="shrink-0 rounded p-2 text-czerwony hover:bg-bialy"
            aria-label="Usuń punkt"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""], isOrdered)}
        className="text-xs font-medium text-czerwony"
      >
        + Dodaj punkt
      </button>
    </div>
  );
}
