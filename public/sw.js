const CACHE_NAME = "trzywiatry-shell-v9";
const APP_SHELL = ["/", "/sklep", "/manifest.webmanifest"];

function shouldBypass(request) {
  if (request.method !== "GET") return true;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return true;
  if (url.pathname === "/sw.js") return true;
  if (url.pathname.startsWith("/_next/")) return true;
  if (url.pathname.startsWith("/admin")) return true;
  if (url.pathname.startsWith("/konto")) return true;
  if (url.pathname.startsWith("/api/")) return true;
  if (url.searchParams.has("_rsc")) return true;
  if (request.headers.get("RSC") || request.headers.get("Next-Router-State-Tree")) return true;
  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (shouldBypass(request)) return;

  // Never write HTML navigations into cache — stale /admin redirects broke the phone PWA.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(request)) || caches.match("/")),
    );
    return;
  }

  const url = new URL(request.url);
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && /\.(?:png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }),
    ),
  );
});
