// Arquivos estáticos do Clube de Matemática; questões do Supabase não são armazenadas.
const CACHE_NAME = 'clube-matematica-shell-v2';
const SHELL = ['./manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(SHELL))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('clube-matematica-shell-') && k !== CACHE_NAME).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req, {cache: 'no-store'}));
    return;
  }
  if (['/manifest.webmanifest', '/icon-192.png', '/icon-512.png'].includes(url.pathname)) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});
