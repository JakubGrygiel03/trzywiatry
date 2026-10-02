"use client";

import Image from "next/image";
import { useState } from "react";

type LibraryItem = { url: string; label: string; deletable?: boolean };

export function AdminMediaLibrary({ initial }: { initial: LibraryItem[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setError(null);
    const body = new FormData();
    body.set("file", file);
    body.set("folder", "cms");
    const res = await fetch("/api/admin/cms-upload", { method: "POST", body, credentials: "same-origin" });
    const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    setPending(false);
    if (!res.ok || !json?.url) {
      setError(json?.error ?? "Nie udało się wgrać zdjęcia.");
      return;
    }
    setItems((prev) => [
      { url: json.url!, label: file.name, deletable: true },
      ...prev.filter((item) => item.url !== json.url),
    ]);
  }

  async function onRemove(item: LibraryItem) {
    if (!item.deletable) return;
    const ok = window.confirm("Usunąć to zdjęcie z biblioteki? Jeśli jest użyte na stronie, podmień je ręcznie w karcie.");
    if (!ok) return;
    setRemoving(item.url);
    setError(null);
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.url }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setRemoving(null);
    if (!res.ok) {
      setError(json?.error ?? "Nie udało się usunąć zdjęcia.");
      return;
    }
    setItems((prev) => prev.filter((entry) => entry.url !== item.url));
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-czarny/15 bg-bialy px-4 py-8 text-sm text-czarny/60 hover:border-czerwony">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={pending}
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
        {pending ? "Wgrywam…" : "Wgraj zdjęcie do biblioteki"}
      </label>
      <p className="text-xs text-czarny/45">
        Usuwać można tylko wgrane pliki. Zdjęcia z katalogu pracowni zostają na stałe.
      </p>
      {error ? <p className="text-sm text-czerwony">{error}</p> : null}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <li key={item.url} className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
            <div className="relative aspect-square bg-krem">
              <Image src={item.url} alt="" fill className="object-cover" sizes="200px" unoptimized />
            </div>
            <div className="flex items-center gap-2 px-2 py-2">
              <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-czarny/45">{item.url}</p>
              {item.deletable ? (
                <button
                  type="button"
                  disabled={removing === item.url}
                  onClick={() => onRemove(item)}
                  className="shrink-0 rounded-full bg-czerwony/10 px-2 py-0.5 text-[10px] font-medium text-czerwony hover:bg-czerwony hover:text-bialy disabled:opacity-50"
                >
                  {removing === item.url ? "…" : "Usuń"}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
