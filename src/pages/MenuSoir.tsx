import { useState } from "react";
import { carteSoir, type Plat } from "../data/menuSoir"; // On imagine un fichier de données dédié
import { useCart } from "../context/CartContext"; 
import "./menuSoir.css";

export default function MenuSoir() {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [filter, setFilter] = useState<Plat["category"] | "Tous">("Tous");
  
  const categories: (Plat["category"] | "Tous")[] = ["Tous", "Entrée", "Plat", "Dessert"];
  const platsFiltres = filter === "Tous" ? carteSoir : carteSoir.filter(p => p.category === filter);

  return (
    <section className="menu-soir-section">
      {/* HEADER NOCTURNE LUXUEUX */}
      <div className="menu-header-soir">
        <div className="header-overlay-dark"></div>
        <div className="header-content-wrapper">
          <div className="header-seal-gold">S</div>
          <span className="menu-badge-gold">L'Expérience Nocturne</span>
          <h2 className="menu-main-title-soir">Menu Du soir</h2>
          <div className="header-ornament-line"></div>
        </div>
      </div>

      {/* FILTRES ÉPURÉS */}
      <div className="menu-filtres-soir">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn-soir ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRILLE GASTRO */}
      <div className="menu-grid">
        {platsFiltres.map(plat => {
          const alreadyInCart = isInCart(plat.id);

          return (
            <div key={plat.id} className="menu-card-outer soir-variant">
              <div className="gold-frame-border"></div>
              
              <div className="menu-card-inner dark-theme">
                <div className="menu-image-container">
                  {plat.image && <img src={plat.image} alt={plat.name} className="menu-img" />}
                  <div className="price-tag-evening">
                    <span>{plat.price}€</span>
                  </div>
                </div>

                <div className="details-container-soir">
                  <div className="title-area">
                    <h3>{plat.name}</h3>
                    <div className="gold-separator"></div>
                  </div>
                  
                  <p className="description-soir">{plat.description}</p>
                  
                  <div className="card-actions">
                    <button 
                      className="btn-add-soir" 
                      onClick={() => addToCart(plat)}
                    >
                      Ajouter à la dégustation
                    </button>

                    {alreadyInCart && (
                      <button 
                        className="btn-remove-soir" 
                        onClick={() => removeFromCart(plat.id)}
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                  <div className="card-footer-star">★ ★ ★</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}