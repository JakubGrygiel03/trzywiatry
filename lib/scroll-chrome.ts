/** Sticky announcement + nav height for anchor / in-page scrolls. */
export function getSiteChromeOffset() {
  if (typeof document === "undefined") return 0;
  const chrome = document.querySelector(".site-chrome");
  return chrome instanceof HTMLElement ? chrome.getBoundingClientRect().height : 0;
}

/** Scroll so `el` sits just below sticky site chrome (not under it). */
export function scrollElementBelowChrome(
  el: Element,
  behavior: ScrollBehavior = "smooth",
) {
  const top = el.getBoundingClientRect().top + window.scrollY - getSiteChromeOffset();
  window.scrollTo({ top: Math.max(0, top), behavior });
}

/** Hash target (`#id`) or top of page, always clear of sticky nav. */
export function scrollToHashOrTop(behavior: ScrollBehavior = "auto") {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const el = document.getElementById(hash);
    if (el) {
      scrollElementBelowChrome(el, behavior);
      return;
    }
  }
  window.scrollTo({ top: 0, left: 0, behavior });
}
