// RunCoach SW v2.0 — index.html NUNCA se cachea
const CACHE_NAME = 'runcoach-v2.0';

// Solo se cachean recursos estáticos que no cambian
const STATIC_CACHE = [
  '/RunCoachJP/icon-192.png',
  '/RunCoachJP/icon-512.png',
  '/RunCoachJP/manifest.json'
];

self.addEventListener('install', e => {
  console.log('📦 RunCoach SW v2.0');
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

  // index.html SIEMPRE desde la red, nunca desde caché
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match('/RunCoachJP/index.html'))
    );
    return;
  }

  // Recursos estáticos: caché primero
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
});
