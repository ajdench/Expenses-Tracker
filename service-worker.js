const CACHE_NAME = 'expense-tracker-cache-v8';

// Derive scope prefix dynamically to work on root or GitHub Pages subpaths
const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const prefix = scopePath === '' ? '' : scopePath;

const APP_VERSION = '20250825-06';
const ASSETS_TO_CACHE = [
  `${prefix}/`,
  `${prefix}/index.html`,
  `${prefix}/styles.css?v=${APP_VERSION}`,
  `${prefix}/app.js?v=${APP_VERSION}`,
  `${prefix}/db.js?v=${APP_VERSION}`,
  `${prefix}/ui.js?v=${APP_VERSION}`,
  `${prefix}/register-sw.js?v=${APP_VERSION}`,
  `${prefix}/manifest.json`,
  `${prefix}/favicon.png`,
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  'https://cdn.jsdelivr.net/npm/idb@7/build/umd.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS_TO_CACHE);
      await self.skipWaiting();
    })()
  );
});

// Fetch event: network-first for HTML/CSS/JS; cache-first for everything else
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  const isVersionedAsset = /\.(?:html|css|js)$/.test(url.pathname);

  if (isVersionedAsset) {
    // Network-first for HTML/CSS/JS so dev changes show immediately
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          const cached = await caches.match(req);
          return cached || fetch(req);
        }
      })()
    );
  } else {
    // Cache-first for other assets
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  }
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});
