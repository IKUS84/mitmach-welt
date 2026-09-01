const CACHE_NAME = "mitmach-welt-v3.0.7-stable1";
const ASSETS = [
  "./",
  "./index.html",
  "./recovery.html",
  "./styles.css",
  "./app.js",
  "./hotfix-3.0.3.js",
  "./hotfix-3.0.4.js",
  "./hotfix-3.0.6.js",
  "./sync.js",
  "./hotfix-3.0.7-stable.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/recovery.html")) {
    event.respondWith(
      fetch(event.request, { cache:"no-store" })
        .catch(() => caches.match("./recovery.html"))
    );
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html")))
  );
});
