// src/components/InstallButton.tsx
import { useState, useEffect } from 'react';
import { Download, X, Apple } from 'lucide-react';
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
  const [showPopup, setShowPopup] = useState(false); // Popup principale
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Détection iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Vérifier si l'app est déjà installée (mode standalone)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode) {
      setIsInstalled(true);
    }

    // Vérifier si l'utilisateur a déjà fermé la popup
    const hasDismissed = localStorage.getItem('install_popup_dismissed');
    if (hasDismissed === 'true') {
      setIsDismissed(true);
    }

    // Écouter l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      // Afficher la popup après un court délai
      setTimeout(() => {
        setShowPopup(true);
      }, 3000);
    };

    // Pour iOS, afficher la popup après un délai
    if (isIOSDevice && !isInStandaloneMode && !hasDismissed) {
      setTimeout(() => {
        setShowPopup(true);
      }, 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowPopup(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowPopup(false);
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowPopup(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    setIsDismissed(true);
    localStorage.setItem('install_popup_dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou fermé
  if (isInstalled || isDismissed) return null;

  return (
    <>
      {/* Popup centrée */}
      {showPopup && (isInstallable || isIOS) && (
        <div className="install-popup-overlay">
          <div className="install-popup-modal">
            <button className="install-popup-close" onClick={handleDismiss}>
              <X size={20} />
            </button>
            
            <div className="install-popup-icon">
              {isIOS ? <Apple size={48} /> : <Download size={48} />}
            </div>
            
            <h3 className="install-popup-title">
              {isIOS ? "Ajoutez Restaurant Signature" : "Installez l'application"}
            </h3>
            
            <p className="install-popup-description">
              {isIOS 
                ? "Ajoutez Restaurant Signature sur votre écran d'accueil pour y accéder en un clin d'œil"
                : "Installez notre application pour une expérience plus rapide et des commandes simplifiées"
              }
            </p>
            
            <div className="install-popup-buttons">
              <button className="install-popup-btn primary" onClick={handleInstallClick}>
                {isIOS ? "Ajouter" : "Installer"}
              </button>
              <button className="install-popup-btn secondary" onClick={handleDismiss}>
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide d'installation pour iOS (modal secondaire) */}
      {showIOSGuide && (
        <div className="ios-guide-overlay">
          <div className="ios-guide-modal">
            <button className="ios-guide-close" onClick={() => setShowIOSGuide(false)}>
              <X size={20} />
            </button>
            
            <div className="ios-guide-icon">📱</div>
            <h3>Ajouter à l'écran d'accueil</h3>
            <p>Suivez ces étapes pour ajouter l'application :</p>
            
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
            
            <button className="ios-guide-ok" onClick={() => setShowIOSGuide(false)}>
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}