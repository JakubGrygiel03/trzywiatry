import type { TrafficKind } from "@/lib/data/traffic-stats";

const CONSENT_KEY = "tw-cookie-consent";

function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

/** First-party beacon after cookie consent — no third-party pixels. */
export function trackShopEvent(kind: TrafficKind, extra?: { slug?: string; path?: string }) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const payload = JSON.stringify({
    kind,
    slug: extra?.slug,
    path: extra?.path ?? `${window.location.pathname}${window.location.search}`,
  });
  const blob = new Blob([payload], { type: "application/json" });
  try {
    if (navigator.sendBeacon?.("/api/track", blob)) return;
  } catch {
    /* fall through */
  }
  void fetch("/api/track", {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
}
