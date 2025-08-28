// Service Worker toggle with safe default (disabled).
// To enable for production, either:
// 1) set window.ENABLE_SW = true BEFORE this script runs, or
// 2) change DEFAULT_ENABLE_SW to true below.
(function () {
  if (!('serviceWorker' in navigator)) return;

  const DEFAULT_ENABLE_SW = false; // flip to true for production deploys
  const urlParams = new URLSearchParams(window.location.search);
  const disabledByParam = urlParams.has('nosw');
  const enabledByWindowFlag = !!window.ENABLE_SW;
  const enableSW = (DEFAULT_ENABLE_SW || enabledByWindowFlag) && !disabledByParam;

  if (!enableSW) {
    console.info('SW disabled (dev/Pages). Unregistering and clearing caches.');
    navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.unregister()));
    if (window.caches?.keys) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
    }
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = new URL('service-worker.js', window.location.href).pathname;
    const scope = new URL('./', window.location.href).pathname;
    navigator.serviceWorker.register(swUrl, { scope })
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
})();
