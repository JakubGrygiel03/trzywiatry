"use client";

import { ClipboardPaste } from "lucide-react";
import { blocksFromClipboardHtml, blocksFromPlainText } from "@/lib/blog/paste-from-word";
import type { BlogBlockInput } from "@/lib/validations/blog";

export function WordPasteField({
  onPasteBlocks,
}: {
  onPasteBlocks: (blocks: BlogBlockInput[]) => void;
}) {
  return (
    <label className="block rounded-xl border border-dashed border-czarny/15 bg-bialy px-4 py-3">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-czarny/55">
        <ClipboardPaste className="h-3.5 w-3.5" />
        Wklej z Worda lub Docs
      </span>
      <textarea
        rows={3}
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-czarny/35"
        placeholder="Ctrl+V — akapity, nagłówki i listy wpadną jako bloki. Zdjęcia dodaj osobno."
        onPaste={(event) => {
          const html = event.clipboardData.getData("text/html");
          const text = event.clipboardData.getData("text/plain");
          const blocks = html ? blocksFromClipboardHtml(html) : blocksFromPlainText(text);
          if (blocks.length === 0) return;
          event.preventDefault();
          onPasteBlocks(blocks);
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}
