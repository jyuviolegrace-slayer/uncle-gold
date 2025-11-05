const CACHE_NAME = 'critter-quest-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/favicon.png',
  '/manifest.json',
  '/assets/star.png',
  '/assets/logo.png',
  '/assets/bg.png',
  '/assets/brawler48x48.png',
  // Data files
  '/assets/data/areas.json',
  '/assets/data/critters.json',
  '/assets/data/items.json',
  '/assets/data/moves.json',
  '/assets/data/types.json',
  '/assets/data/legacy-critters.json',
  '/assets/data/legacy-encounters.json',
  '/assets/data/legacy-events.json',
  '/assets/data/legacy-id-mappings.json',
  '/assets/data/legacy-items.json',
  '/assets/data/legacy-moves.json',
  '/assets/data/legacy-npcs.json',
  '/assets/data/legacy-signs.json',
  // Map files
  '/assets/maps/starter-town.json',
  '/assets/maps/central-plaza.json',
  '/assets/maps/mountain-pass.json',
];

// Install event: cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Cache addAll error:', err);
      });
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Return cached response if available
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }

          // For documents, return offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }

          // For other requests, return a generic offline response
          return new Response('Offline - resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});
