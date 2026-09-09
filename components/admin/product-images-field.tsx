"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Star, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MAX_PRODUCT_IMAGES } from "@/lib/admin-product-constants";
import { cn } from "@/lib/utils";

type LibraryOption = { url: string; label: string };

type PendingFile = {
  id: string;
  file: File;
  preview: string;
};

export function ProductImagesField({ initialImages }: { initialImages: string[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(initialImages.length ? initialImages : []);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [library, setLibrary] = useState<LibraryOption[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const totalCount = images.length + pending.length;
  const canAddMore = totalCount < MAX_PRODUCT_IMAGES;

  const libraryFiltered = useMemo(
    () => library.filter((item) => !images.includes(item.url)),
    [library, images],
  );

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    pending.forEach((item) => dt.items.add(item.file));
    input.files = dt.files;
  }, [pending]);

  useEffect(() => {
    if (!libraryOpen || libraryLoaded) return;

    let cancelled = false;
    setLibraryLoading(true);
    fetch("/api/admin/image-library", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: LibraryOption[]) => {
        if (cancelled) return;
        setLibrary(data);
        setLibraryLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLibrary([]);
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [libraryOpen, libraryLoaded]);

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    const slotsLeft = MAX_PRODUCT_IMAGES - totalCount;
    const next = files.slice(0, slotsLeft).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setPending((prev) => [...prev, ...next]);
  }

  function removePending(id: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addFromLibrary(url: string) {
    if (!canAddMore || images.includes(url)) return;
    setImages((prev) => [...prev, url]);
  }

  return (
    <div className="space-y-4">
      {images.map((url) => (
        <input key={`url-${url}`} type="hidden" name="imageUrls" value={url} />
      ))}

      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-4 transition",
          dragOver ? "border-czerwony bg-czerwony/5" : "border-czarny/15 bg-krem/30",
          !canAddMore && "pointer-events-none opacity-50",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          name="imageFiles"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
          }}
        />

        <div className="flex flex-col items-center gap-2 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-medium text-czarny/80">Dodaj zdjęcia produktu</p>
            <p className="mt-0.5 text-xs text-czarny/45">
              Przeciągnij pliki lub wybierz z dysku · JPG, PNG, WebP · max 5 MB · do {MAX_PRODUCT_IMAGES} zdjęć
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMore}
            className="inline-flex items-center gap-2 rounded-lg bg-czarny px-4 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony disabled:opacity-40"
          >
            <ImagePlus className="h-4 w-4" />
            Wybierz pliki
          </button>
        </div>
      </div>

      {(images.length > 0 || pending.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-lg border border-czarny/10 bg-krem"
            >
              <div className="relative aspect-square">
                <Image src={url} alt="" fill className="object-cover" sizes="160px" unoptimized />
              </div>
              {index === 0 ? (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-czarny/75 px-1.5 py-0.5 text-[10px] font-medium text-bialy">
                  <Star className="h-3 w-3" />
                  Główne
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-czarny/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="rounded bg-bialy/90 p-1 text-czarny disabled:opacity-30"
                    aria-label="Przesuń w lewo"
                  >
                    <ChevronUp className="h-3.5 w-3.5 rotate-[-90deg]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="rounded bg-bialy/90 p-1 text-czarny disabled:opacity-30"
                    aria-label="Przesuń w prawo"
                  >
                    <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="rounded bg-bialy/90 p-1 text-czerwony"
                  aria-label="Usuń zdjęcie"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {pending.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-ceglany/40 bg-krem"
            >
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />
              </div>
              <span className="absolute left-2 top-2 rounded-md bg-ceglany px-1.5 py-0.5 text-[10px] font-medium text-czarny">
                Nowe
              </span>
              <button
                type="button"
                onClick={() => removePending(item.id)}
                className="absolute right-2 top-2 rounded bg-bialy/90 p-1 text-czerwony opacity-0 transition group-hover:opacity-100"
                aria-label="Usuń plik"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-czarny/8 bg-krem/40">
        <button
          type="button"
          onClick={() => setLibraryOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-czarny/75"
        >
          Wybierz z biblioteki
          <span className="flex items-center gap-2">
            {libraryLoading ? <Loader2 className="h-4 w-4 animate-spin text-czarny/40" /> : null}
            <ChevronDown className={cn("h-4 w-4 transition", libraryOpen && "rotate-180")} />
          </span>
        </button>
        {libraryOpen ? (
          <div className="border-t border-czarny/8 p-3">
            {libraryLoading ? (
              <p className="py-6 text-center text-xs text-czarny/45">Ładowanie biblioteki…</p>
            ) : libraryFiltered.length === 0 ? (
              <p className="py-4 text-center text-xs text-czarny/45">Brak dodatkowych zdjęć w bibliotece.</p>
            ) : (
              <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
                {libraryFiltered.map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    disabled={!canAddMore}
                    onClick={() => addFromLibrary(item.url)}
                    className="overflow-hidden rounded-lg border border-czarny/10 bg-bialy text-left transition hover:border-czerwony/40 disabled:opacity-40"
                    title={item.label}
                  >
                    <div className="relative aspect-square">
                      <Image src={item.url} alt="" fill className="object-cover" sizes="100px" unoptimized />
                    </div>
                    <p className="truncate px-1.5 py-1 text-[10px] text-czarny/50">{item.label}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <p className="text-xs text-czarny/40">
        Pierwsze zdjęcie = miniatura w sklepie. Łącznie: {totalCount}/{MAX_PRODUCT_IMAGES}
      </p>
    </div>
  );
}
