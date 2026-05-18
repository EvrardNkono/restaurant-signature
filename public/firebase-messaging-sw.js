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

// URL ABSOLUE de l'administration
const ADMIN_URL = "https://restaurantsignature.fr/admin";

// ✅ FORCER L'ACTIVATION IMMÉDIATE DU SERVICE WORKER
self.addEventListener('install', (event) => {
  console.log('🔥 SW FCM: Installation');
  self.skipWaiting(); // Force l'activation sans attendre
});

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Notification en arrière-plan reçue:', payload);
  
  // Extraire l'ID de commande si disponible
  const orderId = payload.data?.orderId || payload.data?.order_id || '';
  const orderRef = payload.data?.orderRef || '';
  
  // Construire le message
  let bodyText = payload.notification?.body || 'Nouvelle commande !';
  if (orderId) {
    bodyText = `Commande #${orderId} - ${bodyText}`;
  }
  
  const notificationTitle = payload.notification?.title || 'Restaurant Signature';
  const notificationOptions = {
    body: bodyText,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    silent: false,
    tag: `order-${orderId || Date.now()}`,
    renotify: true,
    data: {
      url: ADMIN_URL,
      orderId: orderId,
      orderRef: orderRef,
      click_action: ADMIN_URL
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
  
  // Utiliser l'URL absolue stockée dans les données
  const urlToOpen = event.notification.data?.url || ADMIN_URL;
  const orderId = event.notification.data?.orderId;
  
  console.log(`🔗 Ouverture de: ${urlToOpen} ${orderId ? `(commande #${orderId})` : ''}`);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(windowClients => {
      // Chercher une fenêtre admin déjà ouverte
      for (let client of windowClients) {
        // Vérifier si c'est une page admin (restaurantsignature.fr/admin ou localhost/admin)
        if ((client.url.includes('restaurantsignature.fr/admin') || client.url.includes('localhost/admin')) && 'focus' in client) {
          console.log('✅ Fenêtre admin trouvée, focus');
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      console.log('🆕 Ouverture d\'une nouvelle fenêtre admin');
      return clients.openWindow(urlToOpen);
    })
  );
});

// ✅ ACTIVATION AVEC CLAIM IMMÉDIAT
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker FCM activé');
  event.waitUntil(self.clients.claim()); // Prend le contrôle immédiatement
});