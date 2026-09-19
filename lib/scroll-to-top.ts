/** Pin window to top — used when soft-navigating product → product. */
export function forceDocumentTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;
}

/** Click handler for in-shop product links (cross-sell / recently viewed). */
export function onProductNavigateClick() {
  forceDocumentTop();
  window.requestAnimationFrame(forceDocumentTop);
}
