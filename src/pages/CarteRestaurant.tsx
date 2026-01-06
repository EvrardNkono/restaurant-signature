import { useState } from "react";
import { carte, type Plat } from "../data/menu"; 
import "./carte.css";

export default function CarteRestaurant() {
  const [filter, setFilter] = useState<Plat["category"] | "Tous">("Tous");
  const categories: (Plat["category"] | "Tous")[] = ["Tous", "Entrée", "Plat", "Dessert", "Boisson"];
  const platsFiltres = filter === "Tous" ? carte : carte.filter(p => p.category === filter);

  return (
    <section className="carte-restaurant">
      {/* BANNIÈRE TERRACOTTA (Uniquement pour le titre) */}
      <div className="carte-banner-box">
        <div className="carte-header">
          <div className="header-seal">S</div>
          <span className="carte-badge">La Sélection du Chef</span>
          <h2 className="carte-main-title">Carte Gastronomique</h2>
          <div className="header-double-line"></div>
        </div>
      </div>

      {/* ZONE FILTRES (Retour sur fond blanc) */}
      <div className="carte-filtres">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRILLE SUR FOND BLANC */}
      <div className="plats-grid">
        {platsFiltres.map(plat => (
          <div key={plat.id} className="plat-card-outer">
            <div className="gold-thick-border"></div>
            <div className="plat-card-inner">
              <div className="plat-image-container">
                {plat.image && <img src={plat.image} alt={plat.name} className="plat-img" />}
                <div className="price-badge-luxury">
                  <span>{plat.price}</span>
                </div>
              </div>
              <div className="plat-details-terracotta">
                <div className="title-row">
                  <h3>{plat.name}</h3>
                  <div className="title-underline-gold"></div>
                </div>
                {plat.label && <span className="special-label-white">{plat.label}</span>}
                <p className="description-text-light">{plat.description}</p>
                <div className="card-footer-ornament-gold">✦ ✦ ✦</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}