// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Ta configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCNQL7GuZPLxRfXxgGsNS3JmNFVP_AKyj4",
  authDomain: "restaurant-signature-16476.firebaseapp.com",
  projectId: "restaurant-signature-16476",
  storageBucket: "restaurant-signature-16476.firebasestorage.app",
  messagingSenderId: "954016254361",
  appId: "1:954016254361:web:f9d439d856daef0e3b6b08",
  measurementId: "G-8S2SZR1X2L"
};

// Initialiser Firebase et EXPORTER app
export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Clé VAPID
const VAPID_KEY = "BOmQ73MJH6SreFfExPUgCXuuUpEnR1zwqGGC2LWs6yqZvpjy3yWlHtcOX9LBLVMcEBq9FtwqB2OG1Z-j8TxPjdQ";

// Demander l'autorisation et obtenir le token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permission accordée');
      
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('📱 Token FCM:', token);
      
      await saveTokenToBackend(token);
      
      return token;
    }
    return null;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Sauvegarder le token sur ton backend
const saveTokenToBackend = async (token: string) => {
  const isLocal = window.location.hostname === "localhost";
  const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";
  
  try {
    // 🔧 CORRECTION ICI : appelle /register-admin au lieu de /register-token
    const response = await fetch(`${BASE_API}/notifications/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    if (response.ok) {
      console.log('✅ Token ADMIN enregistré sur le serveur');
      // Stocker dans localStorage pour référence
      localStorage.setItem('admin_token', token);
    } else {
      console.error('❌ Erreur enregistrement token:', response.status);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
};

// Écouter les messages quand l'app est au premier plan
export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log('📨 Notification reçue:', payload);
    
    if (payload.notification) {
      new Notification(payload.notification.title || 'Restaurant Signature', {
        body: payload.notification.body,
        icon: '/icons/icon-192x192.png'
      });
    }
  });
};