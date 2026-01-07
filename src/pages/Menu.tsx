import { useState } from "react";
import { carte, type Plat } from "../data/menu"; 
import { useCart } from "../context/CartContext"; 
import "./menu.css";

export default function Menu() {
  const { addToCart, removeFromCart, isInCart } = useCart();
  
  // Mise à jour de l'état initial et des catégories disponibles
  const [filter, setFilter] = useState<Plat["category"] | "Tous">("Tous");
  
  // Ajout de "Formule" dans le tableau des catégories
  const categories: (Plat["category"] | "Tous")[] = ["Tous", "Formule", "Entrée", "Plat", "Dessert", "Boisson"];

  const platsFiltres = filter === "Tous" 
    ? carte 
    : carte.filter(p => p.category === filter);

  return (
    <section className="menu-section">
      <div className="menu-header">
        <div className="header-overlay"></div>
        <div className="header-content-wrapper">
          <div className="header-seal">M</div>
          <span className="menu-badge">L'Instant Gourmand</span>
          <h2 className="menu-main-title">Menu du Jour</h2>
          <div className="header-double-line"></div>
        </div>
      </div>

      <div className="menu-filtres">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}s
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {platsFiltres.map(plat => {
          const alreadyInCart = isInCart(plat.id);

          return (
            <div key={plat.id} className="menu-card-outer">
              <div className="gold-thick-border"></div>
              
              <div className="menu-card-inner">
                {/* Badge spécial si c'est une formule */}
                {plat.category === "Formule" && (
                  <div className="formula-tag">Menu Complet</div>
                )}

                <div className="menu-image-container">
                  {plat.image ? (
                    <img src={plat.image} alt={plat.name} className="menu-img" />
                  ) : (
                    <div className="placeholder-img">Signature</div>
                  )}
                  <div className="price-badge-luxury">
                    <span>{plat.price}</span>
                  </div>
                </div>

                <div className="menu-details-terracotta">
                  <div className="title-row">
                    <h3>{plat.name}</h3>
                    <div className="title-underline-gold"></div>
                  </div>
                  
                  <p className="description-text-light">{plat.description}</p>
                  
                  <div className="card-actions">
                    <button 
                      className={`add-to-cart-btn ${alreadyInCart ? "in-cart" : ""}`} 
                      onClick={() => addToCart(plat)}
                      disabled={alreadyInCart}
                    >
                      <span className="btn-plus">{alreadyInCart ? "✓" : "+"}</span>
                      <span className="btn-text">
                        {alreadyInCart ? "Dans le panier" : "Ajouter au panier"}
                      </span>
                    </button>

                    {alreadyInCart && (
                      <button 
                        className="remove-from-cart-btn" 
                        onClick={() => removeFromCart(plat.id)}
                      >
                        <span className="btn-text">Retirer</span>
                      </button>
                    )}
                  </div>

                  <div className="card-footer-ornament-gold">✦ ✦ ✦</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}