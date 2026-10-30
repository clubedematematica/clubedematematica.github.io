// Clube de Matemática — service worker robusto para atualização e reinstalação.
const CACHE_NAME = 'clube-matematica-shell-v3';
const ASSETS = ['./manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  // Falhas individuais de ícones não impedem a ativação do service worker.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(ASSETS.map(async path => {
      const response = await fetch(path, {cache:'reload'});
      if (response.ok) await cache.put(path, response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('clube-matematica-shell-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req));
    return;
  }
  if (ASSETS.some(path => new URL(path, self.registration.scope).pathname === url.pathname)) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});
