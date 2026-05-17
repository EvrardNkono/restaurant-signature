import { useState, useEffect } from 'react';
import { Download, X, Apple } from 'lucide-react';
import './InstallButtonAdmin.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallButtonAdmin() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isInStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    const hasDismissed = localStorage.getItem('admin_install_banner_dismissed');
    if (hasDismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setTimeout(() => setShowBanner(true), 2000);
    };

    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 2000);
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
  }, []);

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
    } else {
      // Pas de prompt natif → guide desktop
      setShowBanner(false);
      setShowDesktopGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('admin_install_banner_dismissed', 'true');
  };

  if (isInstalled || isDismissed) return null;

  return (
    <>
      {/* ===== BANNIÈRE ===== */}
      {showBanner && (isInstallable || isIOS) && (
        <div className="admin-install-banner">
          <div className="admin-install-banner-content">
            <div className="admin-install-banner-icon">
              {isIOS ? <Apple size={22} /> : <Download size={22} />}
            </div>
            <div className="admin-install-banner-text">
              <strong>Signature Admin</strong>
              <span>Installer le panneau admin</span>
            </div>
            <button className="admin-install-banner-btn" onClick={handleInstallClick}>
              {isIOS ? 'Ajouter' : 'Installer'}
            </button>
            <button className="admin-install-banner-close" onClick={handleDismiss}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ===== GUIDE iOS ===== */}
      {showIOSGuide && (
        <div className="admin-ios-guide-overlay">
          <div className="admin-ios-guide-modal">
            <button className="admin-ios-guide-close" onClick={() => setShowIOSGuide(false)}>
              <X size={20} />
            </button>
            <div className="admin-ios-guide-icon">📱</div>
            <h3>Ajouter à l'écran d'accueil</h3>
            <p>Suivez ces étapes dans Safari :</p>
            <div className="admin-ios-steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <span>Appuyez sur le bouton</span>
                  <span className="ios-share-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </span>
                  <span><strong>Partager</strong></span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <span>Appuyez sur <strong>"Sur l'écran d'accueil"</strong></span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <span>Appuyez sur <strong>"Ajouter"</strong></span>
                </div>
              </div>
            </div>
            <button className="admin-ios-guide-ok" onClick={() => setShowIOSGuide(false)}>
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* ===== GUIDE DESKTOP ===== */}
      {showDesktopGuide && (
        <div className="admin-ios-guide-overlay">
          <div className="admin-ios-guide-modal">
            <button className="admin-ios-guide-close" onClick={() => setShowDesktopGuide(false)}>
              <X size={20} />
            </button>
            <div className="admin-ios-guide-icon">💻</div>
            <h3>Installer l'application</h3>
            <p>Clique sur l'icône d'installation dans Chrome :</p>
            <div className="admin-ios-steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <span>Regarde à droite de la <strong>barre d'adresse</strong></span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <span>Clique sur l'icône</span>
                  <span className="desktop-install-icon">⊕</span>
                  <span>ou l'écran avec une flèche</span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <span>Clique sur <strong>"Installer"</strong></span>
                </div>
              </div>
            </div>
            <button className="admin-ios-guide-ok" onClick={() => setShowDesktopGuide(false)}>
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}