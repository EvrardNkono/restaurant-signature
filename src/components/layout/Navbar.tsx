import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X, Phone, Lock } from "lucide-react";
import { useCart } from "../../context/CartContext";
import "../../styles/navbar.css";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

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
    e.preventDefault(); // empêche la navigation au logo pendant les clics

    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    // Reset le compteur après 2 secondes d'inactivité
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
      // Si pas arrivé à 5, naviguer normalement vers /
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
            <img src="/images/icone11.png" alt="Signature Restaurant" />
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
  inert={!open ? true : undefined}  // ← AJOUTER CET ATTRIBUT
>
            <button 
              className="mobile-close" 
              onClick={closeMenu}
              aria-label="Fermer le menu"
            >
              <X size={24} aria-hidden="true" />
            </button>
            <div className="mobile-menu-inner" role="navigation" aria-label="Menu mobile">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={closeMenu}>
                  {link.label}
                </Link>
              ))}
              <div className="mobile-phone" aria-label="Téléphone du restaurant">
                <Phone size={14} aria-hidden="true" />
                <span>+33 6 62 03 84 72</span>
              </div>
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