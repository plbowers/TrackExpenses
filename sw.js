// CREATE/INSTALL CACHE
self.addEventListener("install", evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open("Demo")
    .then(cache => cache.addAll([
      "index.html",
      "manifest.json"
      //"YOUR-STYLES.css",
      //"YOUR-SCRIPTS.js",
      //"YOUR-IMAGES.jpg"
    ]))
    .catch(err => console.error(err))
  );
});
 
// CLAIM CONTROL INSTANTLY
self.addEventListener("activate", evt => self.clients.claim());
 
// LOAD FROM CACHE FIRST, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", evt => evt.respondWith(
  caches.match(evt.request).then(res => res || fetch(evt.request))
));