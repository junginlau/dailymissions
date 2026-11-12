const CACHE_NAME = 'my-space-cache-v1.0.6-beta-e';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './images/logo.png',
  './images/icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // 讓新的 Service Worker 立刻進入等待接管狀態
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
  // 接管所有頁面
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request);
    })
  );
});