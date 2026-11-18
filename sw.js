// CORE_VERSION: v0.6.13
//                  chmod +x push.command && ./push.command
const CACHE_NAME = 'my-space-cache-v1.0.14-beta-g';

const ASSETS = [
  './',
  './index.html',
  './about.html',
  './readme/privacy.html',
  './readme/terms.html',
  './css/pc.css',
  './css/pad.css',
  './css/phone.css',
  './lang.js',
  './js/core.js',
  './js/ui.js',
  './js/homes.js',
  './js/ledger.js',
  './js/features/todo.js',
  './js/features/calendar.js',
  './js/features/diary.js',
  './js/features/notes.js',
  './js/features/photos.js',
  './js/features/pomo.js',
  './js/features/trash.js',
  './js/features/settings.js',
  './js/main.js',
  './manifest.json',
  './images/logo.png',
  './images/icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(function (response) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, responseClone);
        });
        return response;
      })
      .catch(function () {
        return caches.match(e.request);
      })
  );
});
