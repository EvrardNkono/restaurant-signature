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
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Détection iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Vérifier si l'app est déjà installée
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode) {
      setIsInstalled(true);
    }

    // Vérifier si l'utilisateur a déjà fermé la bannière
    const hasDismissed = localStorage.getItem('install_banner_dismissed');
    if (hasDismissed === 'true') {
      setIsDismissed(true);
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      // Afficher la bannière après 2 secondes
      setTimeout(() => {
        if (!isDismissed && !isInStandaloneMode) {
          setShowBanner(true);
        }
      }, 2000);
    };

    // Pour iOS, afficher la bannière après un délai
    if (isIOSDevice && !isInStandaloneMode && !isDismissed) {
      setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS, isDismissed]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowBanner(false);
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('install_banner_dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou fermé
  if (isInstalled || isDismissed) return null;

  return (
    <>
      {/* Bannière non bloquante en bas de l'écran */}
      {showBanner && (isInstallable || isIOS) && (
        <div className="install-banner">
          <div className="install-banner-content">
            <div className="install-banner-icon">
              {isIOS ? <Apple size={24} /> : <Download size={24} />}
            </div>
            <div className="install-banner-text">
              <strong>Restaurant Signature</strong>
              <span>Installez notre application</span>
            </div>
            <button className="install-banner-btn" onClick={handleInstallClick}>
              {isIOS ? "Ajouter" : "Installer"}
            </button>
            <button className="install-banner-close" onClick={handleDismiss}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Guide iOS (modal - celui-ci peut bloquer car c'est un guide) */}
      {showIOSGuide && (
        <div className="ios-guide-overlay">
          <div className="ios-guide-modal">
            <button className="ios-guide-close" onClick={() => setShowIOSGuide(false)}>
              <X size={20} />
            </button>
            <div className="ios-guide-icon">📱</div>
            <h3>Ajouter à l'écran d'accueil</h3>
            <p>Suivez ces étapes :</p>
            <div className="ios-safari-steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <span>Appuyez sur</span>
                  <div className="ios-share-icon">⎙</div>
                  <span>Partager</span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <span>Appuyez sur</span>
                  <strong>"Sur l'écran d'accueil"</strong>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <span>Appuyez sur</span>
                  <strong>"Ajouter"</strong>
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