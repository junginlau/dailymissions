// [NEW] 對應全域正式版 v1.0.8
const CACHE_NAME = 'my-space-cache-v1.0.9-beta-c';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './lang.js', 
  './manifest.json',
  './images/logo.png',
  './images/icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    fetch(e.request).then((response) => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(e.request, responseClone);
      });
      return response;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});