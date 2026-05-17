// Service Worker minimal pour activer l'installation PWA sur /admin
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Laisser passer toutes les requêtes normalement
  e.respondWith(fetch(e.request));
});