// Service Worker para RunCoach PWA
const CACHE_VERSION = 'runcoach-v1.0.0';
const CACHE_NAME = `runcoach-cache-${CACHE_VERSION}`;

const CRITICAL_FILES = [
  '/RunCoachJP/',
  '/RunCoachJP/index.html',
  '/RunCoachJP/manifest.json',
  '/RunCoachJP/icon-192.png',
  '/RunCoachJP/icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('📦 RunCoach SW: Instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 RunCoach SW: Cacheando archivos críticos');
      return cache.addAll(CRITICAL_FILES);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('✅ RunCoach SW: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ RunCoach SW: Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/RunCoachJP/index.html');
          }
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ RunCoach Service Worker cargado');
