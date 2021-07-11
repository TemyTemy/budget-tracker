
const FILES_TO_CACHE = [
    "/index.html",
    "/manifest.json",
    "/service-worker.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/index.js",
    "/local-db.js",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  ];
  const STATIC_CACHE = "static-cache-v1";
  const RUNTIME_CACHE = "runtime-cache";
  
 // Service worker setup
self.addEventListener("install", function (event) {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          console.log("Your files were pre-cached successfully!");
          return cache.addAll(FILES_TO_CACHE);
        })
        .then(self.skipWaiting())
    );
  });
  
  // Checks and cleans existing cached data
  self.addEventListener("activate", function (event) {
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return cacheNames.filter(
            (cacheName) => !currentCaches.includes(cacheName)
          );
        })
        .then((cachesToDelete) => {
          return Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });
  
  
  // Reading content from catch via /api/ calls
  self.addEventListener("fetch", function (event) {
    // cache successful requests to the api
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(event.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(event.request.url, response.clone());
                }
                return response;
              })
              .catch((err) => {
                console.log(err);
                return cache.match(event.request);
              });
          })
          .catch((err) => console.log(err))
      );
      return;
    }
  
    // servce static content for non api calls
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.response);
      })
    );
  });