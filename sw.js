// Service Worker for offline functionality
// Update this timestamp when deploying new version to force cache refresh on all devices
const CACHE_VERSION = '2024-08-19-001';
const CACHE_NAME = `ped-bili-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './thresholds_demo.js',
  './thresholds_aap_anyrisk_exchange.js',
  './thresholds_aap_anyrisk_phototherapy.js',
  './manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: All assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Service Worker: Error caching assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response as it can only be consumed once
            const responseToCache = networkResponse.clone();

            // Add to cache for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Network fetch failed', error);
            // Could return a custom offline page here
            throw error;
          });
      })
  );
});

// Message handler for manual cache refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_CACHE_REFRESH') {
    console.log('Service Worker: Force cache refresh requested');
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          // Delete all caches
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('Service Worker: Deleting cache', cacheName);
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          // Re-cache static assets
          return caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('Service Worker: Re-caching static assets');
              return cache.addAll(STATIC_ASSETS);
            });
        })
        .then(() => {
          // Notify all clients
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'CACHE_REFRESHED',
                message: 'Cache has been refreshed successfully'
              });
            });
          });
        })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skip waiting');
    self.skipWaiting();
  }
});

// Check for updates periodically
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-check') {
    console.log('Service Worker: Checking for updates');
    event.waitUntil(
      // Perform update check logic here if needed
      Promise.resolve()
    );
  }
});
  );
});