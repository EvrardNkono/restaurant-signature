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
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src="/images/icone11.png" alt="Signature" />
            <div className="logo-text">
              <span>Signature</span>
              <small>Restaurant</small>
            </div>
          </div>

          {/* NAVIGATION DESKTOP */}
          <nav className="nav-links">
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
          <div className="nav-phone">
            <Phone size={14} />
            <span>+33 6 62 03 84 72</span>
          </div>

          {/* ACTIONS */}
          <div className="nav-actions">
            <Link to="/panier" className="cart-link">
              <ShoppingBag size={22} />
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
            <button className={`burger ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
              <Menu size={22} />
            </button>
          </div>

          {/* MENU MOBILE */}
          <div className={`mobile-menu ${open ? "open" : ""}`}>
            <button className="mobile-close" onClick={closeMenu}>
              <X size={24} />
            </button>
            <div className="mobile-menu-inner">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={closeMenu}>
                  {link.label}
                </Link>
              ))}
              <div className="mobile-phone">
                <Phone size={14} />
                <span>+33 6 62 03 84 72</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ===== MODAL MOT DE PASSE ADMIN ===== */}
      {showAdminModal && (
        <div className="admin-modal-overlay" onClick={closeAdminModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={closeAdminModal}>
              <X size={20} />
            </button>
            <div className="admin-modal-icon">
              <Lock size={28} />
            </div>
            <h3>Accès administration</h3>
            <p>Entrez le mot de passe pour continuer</p>
            <input
              type="password"
              placeholder="Mot de passe"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
              className="admin-modal-input"
              autoFocus
            />
            {adminError && <span className="admin-modal-error">{adminError}</span>}
            <button
              className="admin-modal-btn"
              onClick={handleAdminSubmit}
              disabled={adminLoading}
            >
              {adminLoading ? 'Vérification...' : 'Accéder'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}