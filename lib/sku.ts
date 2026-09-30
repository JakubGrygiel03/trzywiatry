/** Warehouse SKU from slug + variant title when the admin leaves SKU blank. */
export function suggestVariantSku(slug: string, title: string) {
  const slugPart = slug.replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase() || "ITEM";
  const titlePart = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/gi, "l")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 6);
  if (titlePart && titlePart !== "STANDARD" && titlePart !== "WARIANT") {
    return `TW-${slugPart}-${titlePart}`;
  }
  return `TW-${slugPart}`;
}

export function uniqueSku(candidate: string, used: Set<string>) {
  const stem =
    candidate
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "TW-ITEM";
  if (!used.has(stem)) return stem;
  let n = 2;
  while (used.has(`${stem}-${n}`)) n += 1;
  return `${stem}-${n}`;
}
