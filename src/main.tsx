import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// ⚠️ NE PAS importer requestNotificationPermission ici
// import { requestNotificationPermission, listenForMessages } from './services/firebase'

// === PWA: Enregistrement du Service Worker ===
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker PWA enregistré avec succès:', registration);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 Nouvelle version du Service Worker détectée');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📱 Nouvelle version prête, rechargez pour mettre à jour');
              if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du Service Worker PWA:', error);
    }
  } else {
    console.log('⚠️ Service Worker non supporté par ce navigateur');
  }
};

// === Gestion de l'installation PWA ===
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('📱 PWA installable détectée');
  
  const installEvent = new CustomEvent('pwa-install-ready', { detail: deferredPrompt });
  window.dispatchEvent(installEvent);
});

window.addEventListener('appinstalled', () => {
  console.log('✅ Application installée avec succès');
  deferredPrompt = null;
});

// ⚠️ SUPPRIME ou COMMENTE initFirebaseNotifications
// L'activation des notifications se fait UNIQUEMENT via le bouton dans l'admin
// const initFirebaseNotifications = async () => { ... }

// Démarrer l'application
const startApp = async () => {
  await registerServiceWorker();
  // ⚠️ NE PAS appeler initFirebaseNotifications ici
  // L'activation se fait manuellement via le bouton AdminNotifications
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

startApp();