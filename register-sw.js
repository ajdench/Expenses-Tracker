// Temporarily disable Service Worker everywhere (and unregister if present)
(function() {
  if (!('serviceWorker' in navigator)) return;
  console.info('SW registration disabled for development and GitHub Pages testing.');
  // Unregister any existing SW for this scope
  navigator.serviceWorker.getRegistrations?.().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
  // Clear caches to avoid stale assets during iterations
  if (window.caches?.keys) {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
})();
