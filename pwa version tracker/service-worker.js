const CACHE_NAME = 'pomodoro-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache files
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching offline resources');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', evt => {
  if (evt.request.mode !== 'navigate') {
    // Not a page navigation request, just respond from cache if available
    evt.respondWith(
      caches.match(evt.request).then(response => response || fetch(evt.request))
    );
    return;
  }

  // For navigation requests, try network first, fallback to cache
  evt.respondWith(
    fetch(evt.request).catch(() =>
      caches.match('/index.html')
    )
  );
});

