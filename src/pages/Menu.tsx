import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext"; 
import { Loader2 } from "lucide-react";
import "./menu.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/menu" 
  : "https://signature.abbadevelop.net/api/menu";

interface Plat {
  _id: string;
  name: string;
  price: number;
  category: "Entrée" | "Plat" | "Dessert" | "Boisson" | "Formule";
  description: string;
  image: string;
  showInMenuJour: boolean;
}

export default function Menu() {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Plat["category"] | "Tous">("Tous");
  
  const categories: (Plat["category"] | "Tous")[] = ["Tous", "Formule", "Entrée", "Plat", "Dessert", "Boisson"];

  useEffect(() => {
    const fetchMenuDuJour = async () => {
      try {
        const response = await axios.get(API_URL);
        const menuMidi = response.data.data.filter((p: Plat) => p.showInMenuJour === true);
        setPlats(menuMidi);
      } catch (error) {
        console.error("Erreur de récupération du menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuDuJour();
  }, []);

  const platsFiltres = filter === "Tous" 
    ? plats 
    : plats.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="menu-loading">
        <Loader2 className="animate-spin" size={40} color="#D4AF37" />
        <p>Préparation de la carte du jour...</p>
      </div>
    );
  }

  return (
    <section className="menu-section">
      <div className="menu-header">
        <div className="header-overlay"></div>
        <div className="header-content-wrapper">
          <div className="header-text-shield">
            <div className="header-seal">J</div>
            <span className="menu-badge">L'Instant Gourmand</span>
            <h2 className="menu-main-title">Menu du Jour</h2>
            <div className="header-double-line"></div>
          </div>
        </div>
      </div>

      <div className="menu-filtres">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}{cat !== "Tous" ? "s" : ""}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {platsFiltres.length > 0 ? (
          platsFiltres.map(plat => {
            const alreadyInCart = isInCart(plat._id);

            return (
              <div key={plat._id} className="menu-card-outer">
                <div className="gold-thick-border"></div>
                <div className="menu-card-inner">
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
                      <span>{plat.price}€</span>
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
                        onClick={() => addToCart({ ...plat, id: plat._id })} 
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
                          onClick={() => removeFromCart(plat._id)}
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
          })
        ) : (
          /* --- MESSAGE CARTE VIDE JOURNÉE --- */
          <div className="empty-menu-container">
            <div className="empty-menu-content">
              <div className="empty-icon">✧</div>
              <h3>Mise en place en cours</h3>
              <div className="empty-separator"></div>
              <p>
                Le Chef sélectionne actuellement les meilleurs produits du marché 
                pour composer votre menu de ce midi.
              </p>
              <p className="empty-footer">La carte sera disponible d'ici quelques instants.</p>
              <button onClick={() => window.location.reload()} className="refresh-btn">
                Actualiser la page
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}