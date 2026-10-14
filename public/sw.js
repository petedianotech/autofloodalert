/**
 * Automatic Flood Alert - Service Worker
 * Offline shell + background notification support
 * Cache version: bump CACHE_NAME when static assets change
 */
const CACHE_NAME = 'flood-alert-cache-v5';
const OFFLINE_URL = '/index.html';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon-512.png',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure (ok to continue):', err);
      })
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  // Never intercept Firebase / Google / API traffic
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com') ||
    url.includes('fcm.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('/api/')
  ) {
    return;
  }

  // Navigation: network first, offline fallback to app shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets: cache-first for speed, network update in background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'CRITICAL FLOOD WARNING',
    body: 'River flood alert for your village. Move to high ground if needed.',
    village: 'Your Village',
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) {
    try {
      if (event.data) data.body = event.data.text();
    } catch (_) {}
  }

  const title = data.title || 'Flood Alert';
  const options = {
    body: data.body || 'Open the app for details.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'flood_emergency',
    renotify: true,
    requireInteraction: true,
    vibrate: [400, 200, 400, 200, 400],
    data: {
      url: '/',
      village: data.village || '',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open_alarm', title: 'Open Alerts' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            try {
              client.navigate(targetUrl);
            } catch (_) {}
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
