import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// === PWA: Enregistrement du Service Worker ===
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker enregistré avec succès:', registration);
      
      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 Nouvelle version du Service Worker détectée');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📱 Nouvelle version prête, rechargez pour mettre à jour');
              // Optionnel: Afficher une notification pour recharger
              if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
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
  
  // Optionnel: Afficher une bannière personnalisée
  const installEvent = new CustomEvent('pwa-install-ready', { detail: deferredPrompt });
  window.dispatchEvent(installEvent);
});

window.addEventListener('appinstalled', () => {
  console.log('✅ Application installée avec succès');
  deferredPrompt = null;
});

// Démarrer l'application
const startApp = async () => {
  // Enregistrer le Service Worker
  await registerServiceWorker();
  
  // Rendre l'application
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

startApp();