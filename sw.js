const cacheName = 'gr-partes-v2';
const pagina = new URL('./', self.location.href).href;
self.addEventListener('install', event => event.waitUntil(
  caches.open(cacheName).then(cache => cache.add(pagina))
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key =>
    key.startsWith('gr-partes-') && key !== cacheName).map(key => caches.delete(key))))
));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(pagina)));
});
