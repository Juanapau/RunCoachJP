// RunCoach Service Worker — Network First siempre
const CACHE_NAME = 'runcoach-v1.0.4';

const CRITICAL_FILES = [
  '/RunCoachJP/',
  '/RunCoachJP/index.html',
  '/RunCoachJP/manifest.json',
  '/RunCoachJP/icon-192.png',
  '/RunCoachJP/icon-512.png'
];

self.addEventListener('install', e => {
  console.log('📦 RunCoach SW v1.0.4 instalando...');
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CRITICAL_FILES))
  );
});

self.addEventListener('activate', e => {
  console.log('✅ RunCoach SW v1.0.4 activado');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// NETWORK FIRST — siempre intenta la red, usa caché solo si falla
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/RunCoachJP/index.html')))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
