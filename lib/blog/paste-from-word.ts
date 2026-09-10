import type { BlogBlockInput } from "@/lib/validations/blog";

function cleanText(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function paragraphFromElement(el: Element): string {
  return cleanText(el.textContent ?? "");
}

/** Turn Word / Docs HTML into atelier blog blocks. Images from Word are skipped (local paths). */
export function blocksFromClipboardHtml(html: string): BlogBlockInput[] {
  if (typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks: BlogBlockInput[] = [];

  const walk = (node: ParentNode) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase();

      if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
        const text = paragraphFromElement(child);
        if (text) blocks.push({ type: "heading", text });
        continue;
      }

      if (tag === "ul" || tag === "ol") {
        const items = Array.from(child.querySelectorAll(":scope > li"))
          .map((li) => paragraphFromElement(li))
          .filter(Boolean);
        if (items.length) blocks.push({ type: "list", items });
        continue;
      }

      if (tag === "p" || tag === "div") {
        const text = paragraphFromElement(child);
        if (!text) {
          walk(child);
          continue;
        }
        const link = child.querySelector(":scope > a");
        if (link && cleanText(child.textContent ?? "") === cleanText(link.textContent ?? "")) {
          const href = link.getAttribute("href") ?? "";
          const label = cleanText(link.textContent ?? "") || href;
          if (href && label) blocks.push({ type: "link", href, label });
        } else {
          blocks.push({ type: "paragraph", text });
        }
        continue;
      }

      if (tag === "table" || tag === "style" || tag === "o:p") continue;
      walk(child);
    }
  };

  walk(doc.body);
  return blocks;
}

export function blocksFromPlainText(text: string): BlogBlockInput[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split("\n").map((line) => line.replace(/^[-•*]\s+/, "").trim());
      if (chunk.split("\n").every((line) => /^\s*[-•*]\s+/.test(line))) {
        return { type: "list" as const, items: lines.filter(Boolean) };
      }
      return { type: "paragraph" as const, text: cleanText(chunk.replace(/\n/g, " ")) };
    });
}
