import type { Product } from "@/lib/types";

/** Title stays on the name. Short line sits next to the price; the rest goes below. */
export function splitProductCopy(product: Product) {
  const explicit = product.shortDescription?.trim();
  const body = product.description.trim();
  if (explicit) return { short: explicit, long: body };

  const paragraphs = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const first = paragraphs[0] ?? "";
  const looksLikeList = /[•·●]/.test(first) || /^cechy\b/i.test(first);
  if (paragraphs.length >= 2 && first.length <= 220 && !looksLikeList) {
    return { short: first.replace(/\s+/g, " "), long: paragraphs.slice(1).join("\n\n") };
  }

  const sentence = body.match(/^(.+?[.!?])(?:\s+|$)/);
  if (sentence?.[1] && sentence[1].length <= 180) {
    const rest = body.slice(sentence[0].length).trim();
    if (rest) return { short: sentence[1].trim(), long: rest };
  }

  return { short: body.replace(/\s+/g, " "), long: "" };
}

type CopyBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] };

function isBullet(line: string) {
  return /^(?:[•·●]|[-*])\s+/.test(line);
}

function stripBullet(line: string) {
  return line.replace(/^(?:[•·●]|[-*])\s+/, "").trim();
}

function normalizeCopy(text: string) {
  return text
    .replaceAll("\r\n", "\n")
    .replace(/\s+(Cechy|W zestawie są|Zestaw nie zawiera|UWAGA)\s*:/gi, "\n\n$1:\n")
    .replace(/[ \t]*[•·●]\s+/g, "\n• ");
}

/** Turns Woo-style "Cechy: • …" copy into paragraphs, headings and lists. */
export function parseProductLongCopy(text: string): CopyBlock[] {
  const lines = normalizeCopy(text).split("\n");
  const blocks: CopyBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    const joined = paragraph.join(" ").replace(/\s+/g, " ").trim();
    paragraph = [];
    if (joined) blocks.push({ type: "p", text: joined });
  }

  function flushList() {
    if (list.length === 0) return;
    blocks.push({ type: "ul", items: list });
    list = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (isBullet(line)) {
      flushParagraph();
      list.push(stripBullet(line));
      continue;
    }
    flushList();
    if (/^[A-ZĄĆĘŁŃÓŚŹŻ].{1,48}:$/.test(line) || /^(Cechy|W zestawie są|Zestaw nie zawiera|UWAGA)\s*:?$/i.test(line)) {
      flushParagraph();
      blocks.push({ type: "h", text: line.replace(/:$/, "") });
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}
