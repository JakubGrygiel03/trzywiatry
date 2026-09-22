"use client";

import Image from "next/image";
import { ChevronDown, ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LibraryOption = { url: string; label: string };

export function CmsImagePicker({
  value,
  onChange,
  folder = "cms",
  aspectClass = "aspect-[4/3]",
  hint = "Wgraj z dysku albo wybierz z biblioteki.",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: "cms" | "gallery";
  aspectClass?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [library, setLibrary] = useState<LibraryOption[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!libraryOpen || libraryLoaded) return;
    let cancelled = false;
    setLibraryLoading(true);
    fetch("/api/admin/image-library", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: LibraryOption[]) => {
        if (!cancelled) {
          setLibrary(data);
          setLibraryLoaded(true);
        }
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

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await fetch("/api/admin/cms-upload", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload nieudany.");
      onChange(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload nieudany.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className={cn("relative overflow-hidden rounded-xl border border-czarny/10 bg-krem", aspectClass, "max-w-sm")}>
        {value ? (
          <Image src={value} alt="" fill className="object-cover" sizes="320px" unoptimized />
        ) : (
          <div className="flex h-full min-h-[8rem] items-center justify-center text-xs text-czarny/40">Brak zdjęcia</div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void upload(event.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-czarny px-3 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony disabled:opacity-40"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          Wgraj z dysku
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-lg border border-czarny/12 bg-bialy px-3 py-2 text-xs font-medium text-czarny/75"
        >
          Biblioteka
          {libraryLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronDown className={cn("h-3.5 w-3.5", libraryOpen && "rotate-180")} />}
        </button>
      </div>
      <p className="text-xs text-czarny/45">{hint}</p>
      {error ? <p className="text-xs text-czerwony">{error}</p> : null}

      {libraryOpen ? (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-czarny/8 bg-krem/40 p-2">
          {libraryLoading ? (
            <p className="py-6 text-center text-xs text-czarny/45">Ładowanie biblioteki…</p>
          ) : library.length === 0 ? (
            <p className="py-4 text-center text-xs text-czarny/45">Biblioteka jest pusta — wgraj pierwsze zdjęcie.</p>
          ) : (
            <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
              {library.map((item) => (
                <li key={item.url}>
                  <button
                    type="button"
                    title={item.label}
                    onClick={() => onChange(item.url)}
                    className={cn(
                      "relative aspect-square w-full overflow-hidden rounded-md border bg-bialy",
                      item.url === value ? "border-czerwony ring-2 ring-czerwony/30" : "border-czarny/10",
                    )}
                  >
                    <Image src={item.url} alt="" fill className="object-cover" sizes="80px" unoptimized />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
