"use client";

import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Columns2,
  FunctionSquare,
  GripVertical,
  Heading2,
  ImagePlus,
  Link2,
  List,
  Loader2,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { useState } from "react";
import { WordPasteField } from "@/components/admin/word-paste-field";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import type { BlogBlockInput } from "@/lib/validations/blog";
import { cn } from "@/lib/utils";

type BlockItem = { id: string; block: BlogBlockInput };

const BLOCK_LABELS: Record<BlogBlockInput["type"], string> = {
  paragraph: "Tekst",
  heading: "Nagłówek",
  image: "Zdjęcie",
  list: "Lista",
  formula: "Wzór / kod",
  link: "Link",
  "image-row": "Dwa zdjęcia",
};

function newBlock(type: BlogBlockInput["type"]): BlockItem {
  const id = crypto.randomUUID();
  switch (type) {
    case "paragraph":
      return { id, block: { type: "paragraph", text: "" } };
    case "heading":
      return { id, block: { type: "heading", text: "" } };
    case "image":
      return { id, block: { type: "image", src: "", alt: "", caption: "" } };
    case "list":
      return { id, block: { type: "list", items: [""] } };
    case "formula":
      return { id, block: { type: "formula", text: "" } };
    case "link":
      return { id, block: { type: "link", href: "", label: "", prefix: "" } };
    case "image-row":
      return {
        id,
        block: {
          type: "image-row",
          images: [
            { src: "", alt: "" },
            { src: "", alt: "" },
          ],
        },
      };
  }
}

export function BlogBlockEditor({ initialBlocks }: { initialBlocks?: BlogBlockInput[] }) {
  const [items, setItems] = useState<BlockItem[]>(
    initialBlocks?.length
      ? initialBlocks.map((block) => ({ id: crypto.randomUUID(), block }))
      : [newBlock("paragraph")],
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  function updateBlock(id: string, block: BlogBlockInput) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, block } : item)));
  }

  function removeBlock(id: string) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/blog-upload", { method: "POST", body: formData, credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url as string;
  }

  async function uploadBlockImage(id: string, file: File) {
    setUploadingId(id);
    try {
      const url = await uploadImage(file);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id || item.block.type !== "image") return item;
          return {
            ...item,
            block: {
              ...item.block,
              src: url,
              alt: item.block.alt || file.name.replace(/\.[^.]+$/, ""),
            },
          };
        }),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Nie udało się wgrać zdjęcia.");
    } finally {
      setUploadingId(null);
    }
  }

  async function uploadRowImage(id: string, slot: 0 | 1, file: File) {
    setUploadingId(`${id}-${slot}`);
    try {
      const url = await uploadImage(file);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id || item.block.type !== "image-row") return item;
          const images = [...item.block.images] as [
            { src: string; alt: string; caption?: string },
            { src: string; alt: string; caption?: string },
          ];
          images[slot] = {
            ...images[slot],
            src: url,
            alt: images[slot].alt || file.name.replace(/\.[^.]+$/, ""),
          };
          return { ...item, block: { type: "image-row", images } };
        }),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Nie udało się wgrać zdjęcia.");
    } finally {
      setUploadingId(null);
    }
  }

  function appendPasted(blocks: BlogBlockInput[]) {
    setItems((prev) => {
      const incoming = blocks.map((block) => ({ id: crypto.randomUUID(), block }));
      const onlyEmpty =
        prev.length === 1 &&
        prev[0]?.block.type === "paragraph" &&
        prev[0].block.text.trim() === "";
      return onlyEmpty ? incoming : [...prev, ...incoming];
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="blocks" value={JSON.stringify(items.map((item) => item.block))} />
      <WordPasteField onPasteBlocks={appendPasted} />

      {items.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-czarny/10 bg-krem/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-czarny/45">
              <GripVertical className="h-4 w-4" />
              {BLOCK_LABELS[item.block.type]}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="rounded p-1.5 text-czarny/50 hover:bg-bialy disabled:opacity-30"
                aria-label="Przesuń w górę"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === items.length - 1}
                className="rounded p-1.5 text-czarny/50 hover:bg-bialy disabled:opacity-30"
                aria-label="Przesuń w dół"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(item.id)}
                disabled={items.length <= 1}
                className="rounded p-1.5 text-czerwony hover:bg-bialy disabled:opacity-30"
                aria-label="Usuń blok"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {item.block.type === "paragraph" ? (
            <AdminTextarea
              value={item.block.text}
              onChange={(e) => updateBlock(item.id, { type: "paragraph", text: e.target.value })}
              placeholder="Akapit tekstu… Użyj **pogrubienia** jak w Markdown."
              className="min-h-24"
            />
          ) : null}

          {item.block.type === "heading" ? (
            <AdminInput
              value={item.block.text}
              onChange={(e) => updateBlock(item.id, { type: "heading", text: e.target.value })}
              placeholder="Nagłówek sekcji"
            />
          ) : null}

          {item.block.type === "formula" ? (
            <AdminTextarea
              value={item.block.text}
              onChange={(e) => updateBlock(item.id, { type: "formula", text: e.target.value })}
              placeholder="np. skurcz = (wymiar mokry − wymiar po wypale) / wymiar mokry"
              className="min-h-20 font-mono text-sm"
            />
          ) : null}

          {item.block.type === "link" ? (
            <div className="space-y-3">
              <AdminField label="Tekst przed linkiem (opcjonalnie)">
                <AdminInput
                  value={item.block.prefix ?? ""}
                  onChange={(e) =>
                    updateBlock(item.id, {
                      type: "link",
                      href: item.block.type === "link" ? item.block.href : "",
                      label: item.block.type === "link" ? item.block.label : "",
                      prefix: e.target.value,
                    })
                  }
                  placeholder="np. Więcej:"
                />
              </AdminField>
              <AdminField label="Tekst linku" required>
                <AdminInput
                  value={item.block.label}
                  onChange={(e) =>
                    updateBlock(item.id, {
                      type: "link",
                      href: item.block.type === "link" ? item.block.href : "",
                      label: e.target.value,
                      prefix: item.block.type === "link" ? item.block.prefix : "",
                    })
                  }
                  placeholder="Zobacz film"
                />
              </AdminField>
              <AdminField label="Adres URL" required>
                <AdminInput
                  value={item.block.href}
                  onChange={(e) =>
                    updateBlock(item.id, {
                      type: "link",
                      href: e.target.value,
                      label: item.block.type === "link" ? item.block.label : "",
                      prefix: item.block.type === "link" ? item.block.prefix : "",
                    })
                  }
                  placeholder="https://…"
                />
              </AdminField>
            </div>
          ) : null}

          {item.block.type === "image" ? (
            <ImageBlockEditor
              block={item.block}
              uploading={uploadingId === item.id}
              onUpload={(file) => void uploadBlockImage(item.id, file)}
              onChange={(block) => updateBlock(item.id, block)}
            />
          ) : null}

          {item.block.type === "image-row" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {([0, 1] as const).map((slot) => {
                const image = item.block.type === "image-row" ? item.block.images[slot] : null;
                if (!image) return null;
                return (
                  <div key={slot} className="space-y-2 rounded-lg border border-czarny/8 bg-bialy p-3">
                    {image.src ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-krem">
                        <Image src={image.src} alt="" fill className="object-contain" sizes="200px" unoptimized />
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-czarny/15 py-8 text-xs text-czarny/50">
                        {uploadingId === `${item.id}-${slot}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                        Zdjęcie {slot + 1}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadRowImage(item.id, slot, file);
                          }}
                        />
                      </label>
                    )}
                    <AdminInput
                      value={image.alt}
                      onChange={(e) => {
                        if (item.block.type !== "image-row") return;
                        const images = [...item.block.images] as typeof item.block.images;
                        images[slot] = { ...images[slot], alt: e.target.value };
                        updateBlock(item.id, { type: "image-row", images });
                      }}
                      placeholder="Opis (alt)"
                    />
                  </div>
                );
              })}
            </div>
          ) : null}

          {item.block.type === "list" ? (
            <ListBlockEditor
              items={item.block.items}
              onChange={(listItems) => updateBlock(item.id, { type: "list", items: listItems })}
            />
          ) : null}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <AddBlockButton icon={Type} label="Tekst" onClick={() => setItems((p) => [...p, newBlock("paragraph")])} />
        <AddBlockButton icon={Heading2} label="Nagłówek" onClick={() => setItems((p) => [...p, newBlock("heading")])} />
        <AddBlockButton icon={ImagePlus} label="Zdjęcie" onClick={() => setItems((p) => [...p, newBlock("image")])} />
        <AddBlockButton icon={Columns2} label="Dwa zdjęcia" onClick={() => setItems((p) => [...p, newBlock("image-row")])} />
        <AddBlockButton icon={List} label="Lista" onClick={() => setItems((p) => [...p, newBlock("list")])} />
        <AddBlockButton icon={FunctionSquare} label="Wzór" onClick={() => setItems((p) => [...p, newBlock("formula")])} />
        <AddBlockButton icon={Link2} label="Link" onClick={() => setItems((p) => [...p, newBlock("link")])} />
      </div>
    </div>
  );
}

function ImageBlockEditor({
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
  return (
    <div className="space-y-3">
      {block.src ? (
        <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-lg border border-czarny/10 bg-bialy">
          <Image src={block.src} alt="" fill className="object-contain" sizes="400px" unoptimized />
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-czarny/15 bg-bialy py-10 text-sm text-czarny/50",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {uploading ? "Wgrywam…" : "Wybierz zdjęcie"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
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
      {block.src ? (
        <button
          type="button"
          className="text-xs text-czerwony underline-offset-2 hover:underline"
          onClick={() => onChange({ type: "image", src: "", alt: "", caption: "" })}
        >
          Zamień zdjęcie
        </button>
      ) : null}
    </div>
  );
}

function ListBlockEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((listItem, listIndex) => (
        <div key={listIndex} className="flex gap-2">
          <AdminInput
            value={listItem}
            onChange={(e) => {
              const itemsCopy = [...items];
              itemsCopy[listIndex] = e.target.value;
              onChange(itemsCopy);
            }}
            placeholder={`Punkt ${listIndex + 1}`}
          />
          <button
            type="button"
            onClick={() => {
              const itemsCopy = items.filter((_, i) => i !== listIndex);
              onChange(itemsCopy.length ? itemsCopy : [""]);
            }}
            className="shrink-0 rounded p-2 text-czerwony hover:bg-bialy"
            aria-label="Usuń punkt"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="text-xs font-medium text-czerwony">
        + Dodaj punkt
      </button>
    </div>
  );
}

function AddBlockButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Type;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/12 bg-bialy px-3 py-2 text-xs font-medium text-czarny/70 transition hover:border-czerwony/30 hover:text-czerwony"
    >
      <Plus className="h-3.5 w-3.5" />
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
