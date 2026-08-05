const CACHE = 'guild-master-web-v26'
const APP_SHELL = ['/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('guild-master-web-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  // Vite fingerprinted files can be cached indefinitely, but the HTML entry
  // point must be network-first. Otherwise a previous release's cached
  // index.html may reference an asset hash deleted with the new deployment.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) {
        const cachedResponse = response.clone()
        void caches.open(CACHE).then((cache) => cache.put('/index.html', cachedResponse)).catch(() => undefined)
      }
      return response
    }).catch(() => caches.match('/index.html').then((cached) => cached ?? Response.error())))
    return
  }
  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
    if (response.ok) {
      const cachedResponse = response.clone()
      void caches.open(CACHE).then((cache) => cache.put(request, cachedResponse)).catch(() => undefined)
    }
    return response
  }).catch(() => request.mode === 'navigate' ? caches.match('/index.html') : Response.error())))
})
