// RunCoach SW v3.0 — con notificaciones push
const CACHE_NAME = 'runcoach-v3.0';

const STATIC_CACHE = [
  '/RunCoachJP/icon-192.png',
  '/RunCoachJP/icon-512.png',
  '/RunCoachJP/manifest.json'
];

self.addEventListener('install', e => {
  console.log('📦 RunCoach SW v3.0');
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_CACHE))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match('/RunCoachJP/index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      });
    })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();

  // Schedule notification from app
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/RunCoachJP/icon-192.png',
        badge: '/RunCoachJP/icon-192.png',
        tag,
        vibrate: [200, 100, 200],
        data: { url: '/RunCoachJP/' }
      });
    }, delay);
  }
});

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url.includes('/RunCoachJP/') && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/RunCoachJP/');
    })
  );
});
