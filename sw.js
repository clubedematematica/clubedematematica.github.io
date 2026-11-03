// Cache apenas arquivos estáticos do próprio site.
// Dados do Supabase nunca são armazenados aqui.

const CACHE_NAME = 'clube-matematica-shell-v4';

const SHELL_FILES = [
  './',
  './index.html',
  './redacao.html',
  './privacidade.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Um arquivo opcional ausente não impede
    // a instalação do Service Worker.
    await Promise.all(SHELL_FILES.map(async file => {
      try {
        await cache.add(
          new Request(
            new URL(file, self.registration.scope),
            { cache: 'reload' }
          )
        );
      } catch (error) {
        console.warn(
          'Não foi possível armazenar no cache:',
          file,
          error
        );
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(
          key =>
            key.startsWith('clube-matematica-shell-') &&
            key !== CACHE_NAME
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Não intercepta POST, outros métodos,
  // serviços externos ou chamadas ao Supabase.
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request, {
          cache: 'no-store'
        });
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);

        return (
          (await cache.match(request)) ||
          (await cache.match(
            new URL(
              './index.html',
              self.registration.scope
            )
          )) ||
          Response.error()
        );
      }
    })());

    return;
  }

  const shellUrl = new URL(
    './',
    self.registration.scope
  );

  const isShellFile = SHELL_FILES.some(
    file =>
      new URL(file, self.registration.scope).href === url.href
  );

  if (
    isShellFile &&
    url.origin === shellUrl.origin
  ) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return (
          (await caches.match(request)) ||
          Response.error()
        );
      }
    })());
  }
});