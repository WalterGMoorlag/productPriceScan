const CACHE = 'pricescan-v1';
const SHELL = ['.', './index.html', './manifest.json', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Solo cachear el shell — las APIs siempre van a la red
  const url = new URL(e.request.url);
  const isShell = url.origin === self.location.origin;

  if (isShell) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
  // APIs externas (ML, OpenFoodFacts): pasar directo, sin cache
});
