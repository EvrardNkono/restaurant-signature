// src/components/InstallButton.tsx
import { useState, useEffect } from 'react';
import { Download, Smartphone, X, Apple } from 'lucide-react';
import './InstallButton.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Détection iOS plus précise
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Vérifier si l'app est déjà installée (mode standalone)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode) {
      setIsInstalled(true);
    }

    // Écouter l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Ne pas afficher si déjà installé
  if (isInstalled) return null;

  return (
    <>
      {/* Bouton pour Android/Desktop */}
      {isInstallable && !isIOS && (
        <button className="install-btn" onClick={handleInstallClick}>
          <Download size={18} />
          <span>Installer l'application</span>
        </button>
      )}

      {/* Bouton spécifique iOS - toujours visible sur iOS */}
      {isIOS && (
        <button className="install-btn ios" onClick={handleInstallClick}>
          <Apple size={18} />
          <span>Ajouter à l'écran d'accueil</span>
        </button>
      )}

      {/* Guide d'installation pour iOS */}
      {showIOSGuide && (
        <div className="ios-guide-overlay">
          <div className="ios-guide-modal">
            <button className="ios-guide-close" onClick={() => setShowIOSGuide(false)}>
              <X size={20} />
            </button>
            
            <div className="ios-guide-icon">📱</div>
            <h3>Installer Restaurant Signature</h3>
            <p>Pour ajouter l'application sur votre iPhone :</p>
            
            <div className="ios-safari-steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <span>Appuyez sur le bouton</span>
                  <div className="ios-share-icon">⎙</div>
                  <span className="ios-action">Partager</span>
                </div>
              </div>
              
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <span>Faites défiler vers le bas</span>
                </div>
              </div>
              
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <span>Appuyez sur</span>
                  <div className="ios-add-icon">+</div>
                  <span className="ios-action">Sur l'écran d'accueil</span>
                </div>
              </div>
              
              <div className="step">
                <span className="step-num">4</span>
                <div className="step-content">
                  <span>Appuyez sur</span>
                  <strong>Ajouter</strong>
                </div>
              </div>
            </div>

            <div className="ios-tip">
              <span className="tip-icon">💡</span>
              <span>L'icône apparaîtra sur votre écran d'accueil</span>
            </div>
            
            <button className="ios-guide-ok" onClick={() => setShowIOSGuide(false)}>
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}