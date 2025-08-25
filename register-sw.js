// Registers the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const repoName = 'Expenses-Tracker'; // Your GitHub repository name
    let swScope = '/';

    // Determine if we are on GitHub Pages subpath
    if (pathSegments.length > 0 && pathSegments[0] === repoName) {
      swScope = `/${repoName}/`;
    }

    navigator.serviceWorker.register(`${swScope}service-worker.js`, { scope: swScope })
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}