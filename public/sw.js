// Service Worker for SmartServe PWA
const CACHE_NAME = 'smartserve-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
      // Activate this SW immediately
      self.skipWaiting();
    })()
  );
});

// Fetch event - only handle a safe whitelist; avoid caching JS chunks to prevent dev issues
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const whitelisted = urlsToCache.includes(url.pathname);

  if (!sameOrigin || !whitelisted) {
    // For everything else, just go to network
    return; // allow default browser fetch
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
          }
          return resp;
        })
      );
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
      // Become active immediately on open clients
      self.clients && (await self.clients.claim());
    })()
  );
});
