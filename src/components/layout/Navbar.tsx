import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X, Phone, Lock, Newspaper } from "lucide-react";
import { useCart } from "../../context/CartContext";
import "../../styles/navbar.css";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

// Lien direct vers le formulaire d'avis Google (Place ID du restaurant)
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJC5K8D1L75UcRLFLJMr2OF14";

// Icône Google officielle (4 couleurs) en SVG inline — pas besoin de fichier externe
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== EASTER EGG ADMIN =====
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
      navigate('/');
    }, 2000);

    if (newCount >= 5) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setLogoClicks(0);
      setShowAdminModal(true);
    }
  };

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick(e as unknown as React.MouseEvent);
    }
  };

  const handleAdminSubmit = async () => {
    if (!adminPassword.trim()) return;
    setAdminLoading(true);
    setAdminError('');

    try {
      const res = await fetch(`${BASE_API}/admin-auth/check-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();

      if (data.success) {
        setShowAdminModal(false);
        setAdminPassword('');
        navigate('/admin');
      } else {
        setAdminError('Mot de passe incorrect');
      }
    } catch {
      setAdminError('Erreur de connexion');
    } finally {
      setAdminLoading(false);
    }
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setAdminPassword('');
    setAdminError('');
  };
  // ===== FIN EASTER EGG =====

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { closeMenu(); }, [location]);

  useEffect(() => {
    document.body.style.overflow = open || showAdminModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open, showAdminModal]);

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const navLinks = [
    { to: "/", label: "Accueil" },
    { to: "/carte", label: "Notre Carte" },
    { to: "/menu", label: "Menu Jour" },
    { to: "/menu-soir", label: "Menu Soir" },
    { to: "/blog", label: "Blog", icon: <Newspaper size={16} /> }, // Nouveau lien Blog
    { to: "/a-propos", label: "À propos" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">

          {/* LOGO — 5 clics pour accéder à l'admin */}
          <div
            className="logo"
            onClick={handleLogoClick}
            onKeyDown={handleLogoKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Signature Restaurant - retour à l'accueil (5 clics pour accès admin)"
            style={{ cursor: 'pointer' }}
          >
            <span className="logo-badge">
              <img src="/images/icone11.png" alt="Signature Restaurant" />
            </span>
            <div className="logo-text">
              <span>Signature</span>
              <small>Restaurant</small>
            </div>
          </div>

          {/* NAVIGATION DESKTOP */}
          <nav className="nav-links" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? "active" : ""}
              >
                {link.icon && <span className="nav-icon">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* TÉLÉPHONE */}
          <div className="nav-phone" aria-label="Téléphone du restaurant">
            <Phone size={14} aria-hidden="true" />
            <span>+33 6 62 03 84 72</span>
          </div>

          {/* ACTIONS */}
          <div className="nav-actions">
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="google-review-link"
              aria-label="Laisser un avis sur Google"
              title="Laissez-nous un avis sur Google"
            >
              <GoogleIcon size={20} />
            </a>
            <Link
              to="/panier"
              className="cart-link"
              aria-label={`Voir mon panier${totalItems > 0 ? `, ${totalItems} article${totalItems > 1 ? 's' : ''}` : ''}`}
            >
              <ShoppingBag size={22} aria-hidden="true" />
              {totalItems > 0 && (
                <span className="cart-count" aria-live="polite" aria-label={`${totalItems} article${totalItems > 1 ? 's' : ''} dans le panier`}>
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to="/contact" className="nav-cta">
              Réserver
            </Link>
            <button
              className={`burger ${open ? "open" : ""}`}
              onClick={() => setOpen(!open)}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>

          {/* MENU MOBILE */}
          <div
            id="mobile-menu"
            className={`mobile-menu ${open ? "open" : ""}`}
            aria-hidden={!open}
            inert={!open ? true : undefined}
          >
            {/* En-tête du menu mobile : logo + fermeture */}
            <div className="mobile-menu-header">
              <div className="mobile-menu-logo">
                <span className="logo-badge">
                  <img src="/images/icone11.png" alt="Signature Restaurant" />
                </span>
                <span>Signature Restaurant</span>
              </div>
              <button
                className="mobile-close"
                onClick={closeMenu}
                aria-label="Fermer le menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Actions rapides : Panier / Avis Google */}
            <div className="mobile-quick-actions">
              <Link
                to="/panier"
                onClick={closeMenu}
                className="mobile-action-primary"
                aria-label={`Voir mon panier${totalItems > 0 ? `, ${totalItems} article${totalItems > 1 ? 's' : ''}` : ''}`}
              >
                <ShoppingBag size={16} aria-hidden="true" />
                Panier{totalItems > 0 ? ` (${totalItems})` : ''}
              </Link>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-action-secondary"
              >
                <GoogleIcon size={16} />
                Avis Google
              </a>
            </div>

            <div className="mobile-menu-inner" role="navigation" aria-label="Menu mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={`mobile-link-main ${location.pathname === link.to ? "active" : ""}`}
                >
                  {link.icon && <span className="mobile-link-icon">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}

              <hr className="mobile-menu-divider" />

              <div className="mobile-phone" aria-label="Téléphone du restaurant">
                <Phone size={14} aria-hidden="true" />
                <span>+33 6 62 03 84 72</span>
              </div>

              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-google-review"
              >
                <GoogleIcon size={18} />
                <span>Laissez-nous un avis sur Google</span>
              </a>

              <Link to="/contact" onClick={closeMenu} className="mobile-cta">
                Réserver une table
              </Link>

              <p className="mobile-footer-tag">Signature Restaurant</p>
            </div>
          </div>

        </div>
      </header>

      {/* ===== MODAL MOT DE PASSE ADMIN ===== */}
      {showAdminModal && (
        <div
          className="admin-modal-overlay"
          onClick={closeAdminModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="admin-modal-close"
              onClick={closeAdminModal}
              aria-label="Fermer la fenêtre de connexion admin"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <div className="admin-modal-icon" aria-hidden="true">
              <Lock size={28} />
            </div>
            <h3 id="admin-modal-title">Accès administration</h3>
            <p>Entrez le mot de passe pour continuer</p>
            <input
              type="password"
              placeholder="Mot de passe"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
              className="admin-modal-input"
              autoFocus
              aria-label="Mot de passe administrateur"
              aria-invalid={!!adminError}
              aria-describedby={adminError ? "admin-error-message" : undefined}
            />
            {adminError && (
              <span id="admin-error-message" className="admin-modal-error" role="alert">
                {adminError}
              </span>
            )}
            <button
              className="admin-modal-btn"
              onClick={handleAdminSubmit}
              disabled={adminLoading}
              aria-label={adminLoading ? 'Vérification en cours...' : 'Accéder à l\'espace admin'}
            >
              {adminLoading ? 'Vérification...' : 'Accéder'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}