/** Swatch hexes for glaze / clay colour names (UI only — cart keys off variantId). */
export function glazeColorHex(label: string): string | undefined {
  const t = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l");

  if (t.includes("granat") || (t.includes("niebies") && !t.includes("blekit"))) return "#1e3a5f";
  if (t.includes("blekit") || t.includes("lawend")) return "#6b8cae";
  if (t.includes("miod") || t.includes("zlot")) return "#c4a35a";
  // Magenta / berry glaze — not brand terracotta (#9C644E), which reads as brown
  if (t.includes("czerwon") || t.includes("rozow") || t.includes("magenta")) return "#b84a6a";
  if (t.includes("cegl")) return "#c47a52";
  if (t.includes("zielon")) return "#5a6b4a";
  if (t.includes("bial") || t.includes("krem")) return "#f5f2eb";
  if (t.includes("transparent") || t.includes("surow")) return "#cfc8bc";
  return undefined;
}
