// Automatic Flood Alert — unified PWA + FCM service worker (English default)
// Single controller for offline shell, push, and background FCM.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const CACHE_NAME = 'flood-alert-pwa-v6';
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

firebase.initializeApp({
  projectId: 'automatic-flood-alert',
  appId: '1:158763014091:web:5c5f57835516089c37084e',
  apiKey: 'AIzaSyDsh5VHm1rk4tiacIYVkkxZF3LK5lPmH0w',
  authDomain: 'automatic-flood-alert.firebaseapp.com',
  messagingSenderId: '158763014091',
});

const messaging = firebase.messaging();

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA-SW] Pre-cache partial failure:', err);
      })
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
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

function showFloodNotification(title, body, data) {
  const severity = (data && data.severity) || 'red';
  const options = {
    body: body || 'River flood alert for your village. Open the app for details.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: severity === 'yellow' ? 'flood_warning_yellow' : 'critical_flood_alarm',
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [400, 200, 400, 200, 600],
    data: {
      url: (data && data.url) || '/',
      timestamp: Date.now(),
      ...(data || {}),
    },
    actions: [
      { action: 'open_alarm', title: 'Open Alerts' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  return self.registration.showNotification(title || 'Flood Alert', options);
}

messaging.onBackgroundMessage((payload) => {
  const title =
    (payload.notification && payload.notification.title) ||
    (payload.data && payload.data.title) ||
    'Critical Flood Warning';
  const body =
    (payload.notification && payload.notification.body) ||
    (payload.data && payload.data.body) ||
    'River water is rising. Move to high ground if needed.';
  return showFloodNotification(title, body, payload.data || {});
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Critical Flood Warning',
    body: 'River flood alert for your village. Move to high ground if needed.',
  };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (_) {
      try {
        data.body = event.data.text();
      } catch (_) {}
    }
  }
  event.waitUntil(showFloodNotification(data.title, data.body, data));
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, village, peakDelta, isTest, mapsUrl } = event.data;
    event.waitUntil(
      showFloodNotification(title || 'Flood Alert', body, {
        village,
        peakDelta,
        isTest,
        url: mapsUrl || '/',
        severity: isTest ? 'yellow' : 'red',
      })
    );
  }
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
