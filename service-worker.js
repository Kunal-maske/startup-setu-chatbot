const CACHE_NAME = "startup-setu-v1";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Prefer network for API calls (so responses are fresh), fallback to cache
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((r) => r || new Response("", { status: 503 }))
        )
    );
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Put a copy in cache for next time
          return caches.open(CACHE_NAME).then((cache) => {
            // Ignore opaque responses
            if (
              response &&
              response.status === 200 &&
              response.type !== "opaque"
            ) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // If request is for a navigation, return a minimal fallback page stored in cache
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return new Response("", { status: 503 });
        });
    })
  );
});
