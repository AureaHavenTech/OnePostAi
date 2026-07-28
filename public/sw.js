// OnePost AI Service Worker — PWA offline support
const CACHE = "onepost-v1";
self.addEventListener("install", (e) => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  (e as any).waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e: any) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
