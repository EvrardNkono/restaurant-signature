import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Phone } from "lucide-react"; 
import { useCart } from "../../context/CartContext"; 
import "../../styles/navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCart();
  const location = useLocation();

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

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
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        
        {/* LOGO */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src="/images/icone11.png" alt="Signature" />
          <div className="logo-text">
            <span>Signature</span>
            <small>Restaurant</small>
          </div>
        </Link>

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
          {/* Bouton de fermeture à l'intérieur du menu mobile */}
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
  );
}