import { Link } from "react-router-dom";
import { useState } from "react";
import { ShoppingBag } from "lucide-react"; 
import { useCart } from "../../context/CartContext"; // On importe le hook du panier
import "../../styles/navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cart } = useCart(); // On récupère l'état global du panier

  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">

        <h1 className="navbar-logo">
          Restaurant <span>Signature</span>
        </h1>

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
            {/* Le compteur affiche maintenant la longueur du tableau cart */}
            <span className="cart-count">{cart.length}</span>
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