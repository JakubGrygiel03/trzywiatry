"use client";

import {
  AlignCenter,
  AlignLeft,
  Bold,
  ChevronDown,
  ChevronUp,
  Columns2,
  FlipHorizontal,
  FunctionSquare,
  GripVertical,
  Heading2,
  ImagePlus,
  Link2,
  List,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { useState } from "react";
import { ImageBlockEditor, ImageRowSlot, ListBlockEditor } from "@/components/admin/blog-block-fields";
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
  compare: "Przed / po",
};

function newBlock(type: BlogBlockInput["type"]): BlockItem {
  const id = crypto.randomUUID();
  switch (type) {
    case "paragraph":
      return { id, block: { type: "paragraph", text: "", align: "left" } };
    case "heading":
      return { id, block: { type: "heading", text: "", align: "left" } };
    case "image":
      return { id, block: { type: "image", src: "", alt: "", caption: "" } };
    case "list":
      return { id, block: { type: "list", items: [""], ordered: false } };
    case "formula":
      return { id, block: { type: "formula", text: "" } };
    case "link":
      return { id, block: { type: "link", href: "", label: "", prefix: "" } };
    case "image-row":
      return {
        id,
        block: { type: "image-row", images: [{ src: "", alt: "" }, { src: "", alt: "" }] },
      };
    case "compare":
      return {
        id,
        block: {
          type: "compare",
          title: "Skurcz gliny",
          before: { src: "", alt: "Przed wypałem" },
          after: { src: "", alt: "Po wypale" },
          beforeLabel: "Przed wypałem",
          afterLabel: "Po wypale",
        },
      };
  }
}

function wrapBold(value: string) {
  return value.includes("**") ? value : `**${value || "pogrubienie"}**`;
}

export function BlogBlockEditor({
  initialBlocks,
  onChange,
}: {
  initialBlocks?: BlogBlockInput[];
  onChange?: (blocks: BlogBlockInput[]) => void;
}) {
  const [items, setItems] = useState<BlockItem[]>(
    initialBlocks?.length
      ? initialBlocks.map((block) => ({ id: crypto.randomUUID(), block }))
      : [newBlock("paragraph")],
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  function commit(next: BlockItem[]) {
    setItems(next);
    onChange?.(next.map((item) => item.block));
  }

  function updateBlock(id: string, block: BlogBlockInput) {
    commit(items.map((item) => (item.id === id ? { ...item, block } : item)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    commit(next);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((item) => item.id === dragId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    commit(next);
    setDragId(null);
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
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id || item.block.type !== "image") return item;
          return {
            ...item,
            block: { ...item.block, src: url, alt: item.block.alt || file.name.replace(/\.[^.]+$/, "") },
          };
        });
        onChange?.(next.map((item) => item.block));
        return next;
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Nie udało się wgrać zdjęcia.");
    } finally {
      setUploadingId(null);
    }
  }

  async function uploadCompareImage(id: string, side: "before" | "after", file: File) {
    setUploadingId(`${id}-${side}`);
    try {
      const url = await uploadImage(file);
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id || item.block.type !== "compare") return item;
          const photo = { ...item.block[side], src: url, alt: item.block[side].alt || file.name.replace(/\.[^.]+$/, "") };
          return { ...item, block: { ...item.block, [side]: photo } };
        });
        onChange?.(next.map((item) => item.block));
        return next;
      });
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
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id || item.block.type !== "image-row") return item;
          const images = [...item.block.images] as typeof item.block.images;
          images[slot] = { ...images[slot], src: url, alt: images[slot].alt || file.name.replace(/\.[^.]+$/, "") };
          return { ...item, block: { type: "image-row" as const, images } };
        });
        onChange?.(next.map((item) => item.block));
        return next;
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Nie udało się wgrać zdjęcia.");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="blocks" value={JSON.stringify(items.map((item) => item.block))} />
      <WordPasteField
        onPasteBlocks={(blocks) => {
          const incoming = blocks.map((block) => ({ id: crypto.randomUUID(), block }));
          const onlyEmpty =
            items.length === 1 && items[0]?.block.type === "paragraph" && items[0].block.text.trim() === "";
          commit(onlyEmpty ? incoming : [...items, ...incoming]);
        }}
      />

      {items.map((item, index) => (
        <div
          key={item.id}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => dropOn(item.id)}
          className={cn(
            "rounded-xl border border-czarny/10 bg-krem/30 p-4",
            dragId === item.id && "ring-2 ring-czerwony/30",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-czarny/45">
              <button
                type="button"
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragEnd={() => setDragId(null)}
                className="cursor-grab text-czarny/35 hover:text-czarny active:cursor-grabbing"
                aria-label="Przeciągnij blok"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              {BLOCK_LABELS[item.block.type]}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="rounded p-1.5 text-czarny/50 hover:bg-bialy disabled:opacity-30" aria-label="Przesuń w górę">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === items.length - 1} className="rounded p-1.5 text-czarny/50 hover:bg-bialy disabled:opacity-30" aria-label="Przesuń w dół">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => commit(items.length <= 1 ? items : items.filter((row) => row.id !== item.id))} disabled={items.length <= 1} className="rounded p-1.5 text-czerwony hover:bg-bialy disabled:opacity-30" aria-label="Usuń blok">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {item.block.type === "paragraph" ? (
            <div className="space-y-2">
              <AlignToolbar
                align={item.block.align}
                onAlign={(align) => {
                  if (item.block.type !== "paragraph") return;
                  updateBlock(item.id, { type: "paragraph", text: item.block.text, align });
                }}
                onBold={() =>
                  updateBlock(item.id, {
                    type: "paragraph",
                    text: wrapBold(item.block.type === "paragraph" ? item.block.text : ""),
                    align: item.block.type === "paragraph" ? item.block.align : "left",
                  })
                }
              />
              <AdminTextarea
                value={item.block.text}
                onChange={(e) =>
                  updateBlock(item.id, {
                    type: "paragraph",
                    text: e.target.value,
                    align: item.block.type === "paragraph" ? item.block.align : "left",
                  })
                }
                placeholder="Akapit. Pogrubienie: zaznacz i kliknij B albo otocz **gwiazdkami**."
                className={cn("min-h-24", item.block.align === "center" && "text-center")}
              />
            </div>
          ) : null}

          {item.block.type === "heading" ? (
            <div className="space-y-2">
              <AlignToolbar
                align={item.block.align}
                onAlign={(align) => {
                  if (item.block.type !== "heading") return;
                  updateBlock(item.id, { type: "heading", text: item.block.text, align });
                }}
              />
              <AdminInput
                value={item.block.text}
                onChange={(e) =>
                  updateBlock(item.id, {
                    type: "heading",
                    text: e.target.value,
                    align: item.block.type === "heading" ? item.block.align : "left",
                  })
                }
                placeholder="Nagłówek sekcji"
                className={item.block.align === "center" ? "text-center" : undefined}
              />
            </div>
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
                    updateBlock(item.id, { type: "link", href: item.block.type === "link" ? item.block.href : "", label: item.block.type === "link" ? item.block.label : "", prefix: e.target.value })
                  }
                  placeholder="np. Więcej:"
                />
              </AdminField>
              <AdminField label="Tekst linku" required>
                <AdminInput
                  value={item.block.label}
                  onChange={(e) =>
                    updateBlock(item.id, { type: "link", href: item.block.type === "link" ? item.block.href : "", label: e.target.value, prefix: item.block.type === "link" ? item.block.prefix : "" })
                  }
                  placeholder="Zobacz film"
                />
              </AdminField>
              <AdminField label="Adres URL" required>
                <AdminInput
                  value={item.block.href}
                  onChange={(e) =>
                    updateBlock(item.id, { type: "link", href: e.target.value, label: item.block.type === "link" ? item.block.label : "", prefix: item.block.type === "link" ? item.block.prefix : "" })
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

          {item.block.type === "compare"
            ? (() => {
                const block = item.block;
                return (
            <div className="space-y-3">
              <AdminField label="Tytuł porównania">
                <AdminInput
                  value={block.title}
                  onChange={(e) => updateBlock(item.id, { ...block, title: e.target.value })}
                />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["before", "after"] as const).map((side) => (
                  <div key={side} className="space-y-2">
                    <AdminInput
                      value={side === "before" ? block.beforeLabel ?? "" : block.afterLabel ?? ""}
                      onChange={(e) =>
                        updateBlock(item.id, {
                          ...block,
                          ...(side === "before" ? { beforeLabel: e.target.value } : { afterLabel: e.target.value }),
                        })
                      }
                      placeholder={side === "before" ? "Przed wypałem" : "Po wypale"}
                    />
                    <ImageRowSlot
                      image={block[side]}
                      uploading={uploadingId === `${item.id}-${side}`}
                      onUpload={(file) => void uploadCompareImage(item.id, side, file)}
                      onAltChange={(alt) =>
                        updateBlock(item.id, {
                          ...block,
                          [side]: { ...block[side], alt },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
                );
              })()
            : null}

          {item.block.type === "image-row" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {([0, 1] as const).map((slot) => {
                const image = item.block.type === "image-row" ? item.block.images[slot] : null;
                if (!image) return null;
                return (
                  <ImageRowSlot
                    key={slot}
                    image={image}
                    uploading={uploadingId === `${item.id}-${slot}`}
                    onUpload={(file) => void uploadRowImage(item.id, slot, file)}
                    onAltChange={(alt) => {
                      if (item.block.type !== "image-row") return;
                      const images = [...item.block.images] as typeof item.block.images;
                      images[slot] = { ...images[slot], alt };
                      updateBlock(item.id, { type: "image-row", images });
                    }}
                  />
                );
              })}
            </div>
          ) : null}

          {item.block.type === "list" ? (
            <ListBlockEditor
              items={item.block.items}
              ordered={item.block.ordered}
              onChange={(listItems, ordered) => updateBlock(item.id, { type: "list", items: listItems, ordered })}
            />
          ) : null}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <AddBlockButton icon={Type} label="Tekst" onClick={() => commit([...items, newBlock("paragraph")])} />
        <AddBlockButton icon={Heading2} label="Nagłówek" onClick={() => commit([...items, newBlock("heading")])} />
        <AddBlockButton icon={ImagePlus} label="Zdjęcie" onClick={() => commit([...items, newBlock("image")])} />
        <AddBlockButton icon={Columns2} label="Dwa zdjęcia" onClick={() => commit([...items, newBlock("image-row")])} />
        <AddBlockButton icon={FlipHorizontal} label="Przed / po" onClick={() => commit([...items, newBlock("compare")])} />
        <AddBlockButton icon={List} label="Lista" onClick={() => commit([...items, newBlock("list")])} />
        <AddBlockButton icon={FunctionSquare} label="Wzór" onClick={() => commit([...items, newBlock("formula")])} />
        <AddBlockButton icon={Link2} label="Link" onClick={() => commit([...items, newBlock("link")])} />
      </div>
    </div>
  );
}

function AlignToolbar({
  align,
  onAlign,
  onBold,
}: {
  align?: "left" | "center";
  onAlign: (align: "left" | "center") => void;
  onBold?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <button type="button" onClick={() => onAlign("left")} className={cn("rounded-lg border p-1.5", align !== "center" ? "border-czerwony/40 bg-bialy text-czerwony" : "border-czarny/10 text-czarny/40")} aria-label="Wyrównaj do lewej">
        <AlignLeft className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => onAlign("center")} className={cn("rounded-lg border p-1.5", align === "center" ? "border-czerwony/40 bg-bialy text-czerwony" : "border-czarny/10 text-czarny/40")} aria-label="Wyśrodkuj">
        <AlignCenter className="h-3.5 w-3.5" />
      </button>
      {onBold ? (
        <button type="button" onClick={onBold} className="rounded-lg border border-czarny/10 p-1.5 text-czarny/50 hover:text-czerwony" aria-label="Pogrubienie">
          <Bold className="h-3.5 w-3.5" />
        </button>
      ) : null}
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
