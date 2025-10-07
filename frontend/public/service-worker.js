const CACHE_PREFIX = 'todo-app-pwa';
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `${CACHE_PREFIX}-${CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === self.location.origin) {
    if (APP_SHELL_URLS.includes(requestUrl.pathname) || requestUrl.pathname.startsWith('/assets/')) {
      event.respondWith(cacheFirst(event.request));
      return;
    }

    if (requestUrl.pathname === '/') {
      event.respondWith(networkFirst(event.request));
      return;
    }
  }

  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(networkWithCacheFallback(event.request));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function networkWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok && request.url.startsWith(self.location.origin)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
