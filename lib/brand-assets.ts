export type ChmurkaColor = "czerwona" | "ceglasta" | "szara" | "biala";
export type ChmurkaShape = "a" | "b" | "c";
export type WzorId = "a" | "b" | "c" | "d" | "e";

export function chmurkaSrc(color: ChmurkaColor, shape: ChmurkaShape) {
  return `/brand/chmurki/${color}-${shape}.png`;
}

export function wzorSrc(id: WzorId) {
  return `/brand/wzory/${id}.png`;
}

export function chmurkaTextTone(color: ChmurkaColor): "light" | "dark" {
  return color === "biala" || color === "szara" ? "dark" : "light";
}
