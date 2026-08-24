// OnePost AI — Service Worker
// Caches core app shell for fast repeat loads and offline readiness

const CACHE_NAME = "onepost-v1";
const SHELL_FILES = ["/", "/login", "/pricing", "/about", "/contact", "/faq"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_FILES).catch(() => {
        // Non-critical — shell files may 404 on first visit; that's fine
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only cache GET navigation requests — skip API, static assets handled by CDN
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((cached) => cached || Response.error());
    })
  );
});