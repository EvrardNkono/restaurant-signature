// public/sw.js
const CACHE_NAME = 'signature-v1';
const STATIC_CACHE = 'signature-static-v1';
const DYNAMIC_CACHE = 'signature-dynamic-v1';

// Ressources à mettre en cache au premier chargement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icone11.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installation');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 SW: Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => console.error('SW: Erreur cache', err))
  );
  self.skipWaiting();
});

// Activation - nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('🚀 SW: Activation');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('🗑️ SW: Suppression ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ⚠️ IGNORER TOUTES LES MÉTHODES QUI NE SONT PAS GET
  if (event.request.method !== 'GET') {
    console.log('🚫 SW: Ignorer méthode', event.request.method, url.pathname);
    return;
  }
  
  // Ne pas mettre en cache les appels API
  if (url.pathname.startsWith('/api/')) {
    console.log('🚫 SW: Ignorer API', url.pathname);
    return;
  }
  
  // Ne pas mettre en cache les requêtes admin
  if (url.pathname.startsWith('/admin')) {
    console.log('🚫 SW: Ignorer admin', url.pathname);
    return;
  }
  
  // Ignorer les requêtes vers le backend Vercel
  if (url.hostname.includes('vercel.app') && url.pathname.startsWith('/api/')) {
    console.log('🚫 SW: Ignorer backend Vercel', url.href);
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            console.log('⚠️ SW: Hors ligne, utilisation du cache pour', url.pathname);
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

// Gestion des notifications push (optionnel)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle mise à jour disponible',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Restaurant Signature', options)
  );
});