// PWA Clube de Matemática. Nunca armazene respostas do Supabase em cache.
const CACHE_NAME = 'clube-matematica-shell-v1';
const SHELL = ['./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('clube-matematica-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req, {cache:'no-store'})); // Atualizações e senha antiga nunca vêm do cache do PWA.
    return;
  }
  if (url.pathname.endsWith('/manifest.webmanifest') || url.pathname.includes('/icons/')) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});
