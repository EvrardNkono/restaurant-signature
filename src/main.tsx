// main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// === PWA: Enregistrement du Service Worker ===
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker PWA enregistré:', registration);
      
      // Écouter les mises à jour SANS demander de rechargement automatique
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 Nouvelle version du Service Worker disponible');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📱 Nouvelle version prête');
              // ⚠️ NE PAS APPELER confirm() automatiquement
              // Optionnel : afficher un toast silencieux
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur Service Worker:', error);
    }
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

// === Démarrer l'application ===
const startApp = async () => {
  await registerServiceWorker();
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

startApp();