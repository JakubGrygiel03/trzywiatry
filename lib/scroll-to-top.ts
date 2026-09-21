/** Pin window to top — used when soft-navigating product → product. */
export function forceDocumentTop() {
  if (typeof window === "undefined") return;
  const html = document.documentElement;
  const { body } = document;
  html.style.overflowAnchor = "none";
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  html.scrollLeft = 0;
  body.scrollTop = 0;
  body.scrollLeft = 0;
  // Nested scroll roots (rare) — keep gutters even
  document.querySelectorAll<HTMLElement>(".site-shell, .site-frame, main").forEach((el) => {
    if (el.scrollTop) el.scrollTop = 0;
    if (el.scrollLeft) el.scrollLeft = 0;
  });
}

const TOP_PULSE_MS = [0, 16, 50, 100, 200, 400, 700, 1100];

/** Keep hammering top while the new PDP layout / images settle. */
export function pulseDocumentTop(delays: number[] = TOP_PULSE_MS) {
  forceDocumentTop();
  return delays.map((ms) => window.setTimeout(forceDocumentTop, ms));
}

/** Click handler for in-shop product links (cross-sell / recently viewed). */
export function onProductNavigateClick() {
  forceDocumentTop();
  window.requestAnimationFrame(forceDocumentTop);
  // Extra frames — soft /sklep/[slug] → /sklep/[other] often restores mid-page once.
  pulseDocumentTop([0, 30, 80, 160, 320, 600]);
}
