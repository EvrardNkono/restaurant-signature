import { Link } from "react-router-dom";
import { useState } from "react";
import { ShoppingBag } from "lucide-react"; 
import { useCart } from "../../context/CartContext"; 
import "../../styles/navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cart } = useCart(); 

  const closeMenu = () => setOpen(false);

  // Correction de l'erreur "never read" : on utilise 'cart' ici
  // On calcule la somme des quantités de tous les produits
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* LOGOS ALIGNÉS HORIZONTALEMENT */}
        <Link to="/" className="navbar-logo-container" onClick={closeMenu}>
          <img 
            src="/images/resto.png" 
            alt="Restaurant Signature Logo" 
            className="navbar-logo-img" 
          />
          <img 
            src="/images/resto2.png" 
            alt="Signature Icon" 
            className="navbar-logo-secondary" 
          />
        </Link>

        <nav className={`navbar-links ${open ? "open" : ""}`}>
          <Link to="/" onClick={closeMenu}>Accueil</Link>
          <Link to="/carte" onClick={closeMenu}>Notre Carte</Link>
          <Link to="/menu" onClick={closeMenu}>Menu jour</Link>
          <Link to="/menu-soir" onClick={closeMenu}>Menu soir</Link>
          <Link to="/a-propos" onClick={closeMenu}>À propos</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
        </nav>

        {/* ZONE PANIER ET BURGER */}
        <div className="navbar-actions">
          <Link to="/panier" className="cart-icon-link" onClick={closeMenu}>
            <ShoppingBag size={24} strokeWidth={1.5} />
            {/* On affiche le badge seulement si le panier contient des articles */}
            {totalItems > 0 && (
              <span className="cart-count">{totalItems}</span>
            )}
          </Link>

          <button
            className={`burger ${open ? "open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

      </div>
    </header>
  );
}