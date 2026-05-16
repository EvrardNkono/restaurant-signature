// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCNQL7GuZPLxRfXxgGsNS3JmNFVP_AKyj4",
  authDomain: "restaurant-signature-16476.firebaseapp.com",
  projectId: "restaurant-signature-16476",
  storageBucket: "restaurant-signature-16476.firebasestorage.app",
  messagingSenderId: "954016254361",
  appId: "1:954016254361:web:f9d439d856daef0e3b6b08",
  measurementId: "G-8S2SZR1X2L"
});

const messaging = firebase.messaging();

// ✅ FORCER L'ACTIVATION IMMÉDIATE DU SERVICE WORKER
self.addEventListener('install', (event) => {
  console.log('🔥 SW FCM: Installation');
  self.skipWaiting(); // Force l'activation sans attendre
});

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Notification en arrière-plan reçue:', payload);
  
  const notificationTitle = payload.notification?.title || 'Restaurant Signature';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle commande !',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    silent: false,
    tag: 'new-order',
    renotify: true,
    data: {
      url: payload.data?.url || '/admin/orders',
      click_action: '/admin/orders'
    }
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
  
  self.registration.getNotifications().then(notifications => {
    console.log(`📬 ${notifications.length} notification(s) active(s)`);
  });
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Clic sur notification:', event.notification);
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/admin/orders';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ✅ ACTIVATION AVEC CLAIM IMMÉDIAT
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker FCM activé');
  event.waitUntil(self.clients.claim()); // Prend le contrôle immédiatement
});