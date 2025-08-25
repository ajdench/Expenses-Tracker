const CACHE_NAME = 'expense-tracker-cache-v1';

const repoName = 'Expenses-Tracker'; // Your GitHub repository name
const isGitHubPages = self.location.pathname.includes(`/${repoName}/`);
const prefix = isGitHubPages ? `/${repoName}` : '';

const ASSETS_TO_CACHE = [
  `${prefix}/`,
  `${prefix}/index.html`,
  `${prefix}/styles.css`,
  `${prefix}/app.js`,
  `${prefix}/db.js`,
  `${prefix}/ui.js`,
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
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});