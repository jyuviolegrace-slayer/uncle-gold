const CACHE_NAME = 'critter-quest-v2';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/favicon.png',
  '/manifest.json',
  '/assets/star.png',
  '/assets/logo.png',
  '/assets/bg.png',
  '/assets/brawler48x48.png',
  // Texture assets
  '/assets/images/kenneys-assets/ui-space-expansion/custom-ui.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_green_left.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_green_mid.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_green_right.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_left.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_mid.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_right.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_blue_left.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_blue_mid.png',
  '/assets/images/kenneys-assets/ui-space-expansion/barHorizontal_blue_right.png',
  '/assets/images/kenneys-assets/ui-space-expansion/glassPanel.png',
  '/assets/images/kenneys-assets/ui-space-expansion/glassPanel_green.png',
  '/assets/images/kenneys-assets/ui-space-expansion/glassPanel_purple.png',
  '/assets/images/kenneys-assets/ui-pack/blue_button01.png',
  '/assets/images/kenneys-assets/ui-pack/blue_button00.png',
  '/assets/images/monster-tamer/battle-backgrounds/forest-background.png',
  '/assets/images/monster-tamer/battle/cosmoball.png',
  '/assets/images/monster-tamer/battle/damagedBall.png',
  '/assets/images/monster-tamer/monsters/iguanignite.png',
  '/assets/images/monster-tamer/monsters/carnodusk.png',
  '/assets/images/monster-tamer/monsters/Ignivolt.png',
  '/assets/images/monster-tamer/monsters/aquavalor.png',
  '/assets/images/monster-tamer/monsters/frostsaber.png',
  '/assets/images/monster-tamer/ui/cursor.png',
  '/assets/images/monster-tamer/ui/cursor_white.png',
  '/assets/images/monster-tamer/ui/title/background.png',
  '/assets/images/monster-tamer/ui/title/title_text.png',
  '/assets/images/monster-tamer/ui/title/title_background.png',
  '/assets/images/monster-tamer/ui/monster-party/background.png',
  '/assets/images/monster-tamer/ui/monster-party/monster-details-background.png',
  '/assets/images/monster-tamer/ui/inventory/bag_background.png',
  '/assets/images/monster-tamer/ui/inventory/bag.png',
  '/assets/images/monster-tamer/map/main_1_level_background.png',
  '/assets/images/monster-tamer/map/main_1_level_foreground.png',
  '/assets/images/monster-tamer/map/forest_1_level_background.png',
  '/assets/images/monster-tamer/map/forest_1_level_foreground.png',
  '/assets/images/monster-tamer/map/buildings/building_1_level_background.png',
  '/assets/images/monster-tamer/map/buildings/building_1_level_foreground.png',
  '/assets/images/monster-tamer/map/buildings/building_2_level_background.png',
  '/assets/images/monster-tamer/map/buildings/building_2_level_foreground.png',
  '/assets/images/monster-tamer/map/buildings/building_3_level_background.png',
  '/assets/images/monster-tamer/map/buildings/building_3_level_foreground.png',
  '/assets/images/monster-tamer/map/bushes.png',
  '/assets/images/monster-tamer/map/collision.png',
  '/assets/images/monster-tamer/map/encounter.png',
  '/assets/images/pimen/ice-attack/active.png',
  '/assets/images/pimen/ice-attack/start.png',
  '/assets/images/pimen/slash.png',
  '/assets/images/axulart/beach/crushed.png',
  '/assets/images/axulart/character/custom.png',
  '/assets/images/parabellum-games/characters.png',
  // Audio assets
  '/assets/audio/xDeviruchi/And-the-Journey-Begins.wav',
  '/assets/audio/xDeviruchi/Decisive-Battle.wav',
  '/assets/audio/xDeviruchi/Title-Theme.wav',
  '/assets/audio/leohpaz/03_Claw_03.wav',
  '/assets/audio/leohpaz/03_Step_grass_03.wav',
  '/assets/audio/leohpaz/13_Ice_explosion_01.wav',
  '/assets/audio/leohpaz/51_Flee_02.wav',
  // Core data files
  '/assets/data/areas.json',
  '/assets/data/areas.schema.json',
  '/assets/data/critters.json',
  '/assets/data/critters.schema.json',
  '/assets/data/items.json',
  '/assets/data/items.schema.json',
  '/assets/data/moves.json',
  '/assets/data/moves.schema.json',
  '/assets/data/types.json',
  '/assets/data/types.schema.json',
  '/assets/data/legacy-critters.json',
  '/assets/data/legacy-encounters.json',
  '/assets/data/legacy-events.json',
  '/assets/data/legacy-id-mappings.json',
  '/assets/data/legacy-items.json',
  '/assets/data/legacy-moves.json',
  '/assets/data/legacy-npcs.json',
  '/assets/data/legacy-signs.json',
  // Legacy data payloads
  '/assets/data/legacy/attacks.json',
  '/assets/data/legacy/animations.json',
  '/assets/data/legacy/items.json',
  '/assets/data/legacy/monsters.json',
  '/assets/data/legacy/encounters.json',
  '/assets/data/legacy/npcs.json',
  '/assets/data/legacy/events.json',
  '/assets/data/legacy/signs.json',
  '/assets/data/legacy/building_1.json',
  '/assets/data/legacy/building_2.json',
  '/assets/data/legacy/building_3.json',
  '/assets/data/legacy/forest_1.json',
  '/assets/data/legacy/main_1.json',
  '/assets/data/legacy/level.json',
  '/assets/data/legacy/level_old.json',
  // Map files
  '/assets/maps/starter-town.json',
  '/assets/maps/central-plaza.json',
  '/assets/maps/mountain-pass.json',
  '/assets/maps/starter-forest.json',
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
