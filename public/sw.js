const CACHE_NAME = 'wikiburst-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('wikipedia.org/api/rest_v1/page/random')) {
     // Don't cache random calls in standard service worker cache, idb handles it
     return;
  }
  
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then(res => {
          // If we want to dynamically cache image requests for offline
          if (event.request.url.includes('upload.wikimedia.org')) {
             const resClone = res.clone();
             caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          }
          return res;
        });
      }).catch(() => {
        // Offline fallback for general assets
        return new Response('', { status: 503, statusText: 'Offline' });
      })
    );
  }
});
