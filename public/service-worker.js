/* SafeID — Service Worker */
const CACHE_NAME = 'safeid-v1';
const CORE_ASSETS = [
  '/',
  '/public/index.html',
  '/public/login-site.html',
  '/public/sign-up.html',
  '/public/emergency.html',
  '/public/offline.html',
  '/public/404.html',
  '/public/css/base.css',
  '/public/css/components.css',
  '/public/css/layout.css',
  '/public/css/auth.css',
  '/public/css/dashboard.css',
  '/public/css/parent.css',
  '/public/css/admin.css',
  '/public/css/emergency.css',
  '/public/js/config.js',
  '/public/js/api.js',
  '/public/js/auth.js',
  '/public/js/ui.js',
  '/public/assets/safeid-logo.png',
  '/public/manifest.json'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((c) => c.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', (e) => {
  const { request } = e;

  /* Only handle GET requests */
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* ★ Ignore non-http(s) requests (chrome-extension://, moz-extension://, etc.) */
  if (!url.protocol.startsWith('http')) return;

  /* Skip API + emergency routes (network-first, no caching) */
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/emergency/')) {
    e.respondWith(fetch(request).catch(() => caches.match('/public/offline.html')));
    return;
  }

  /* Cache-first for static assets */
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((res) => {
        /* Only cache successful basic responses */
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }

        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('/public/offline.html'));
    })
  );
});
