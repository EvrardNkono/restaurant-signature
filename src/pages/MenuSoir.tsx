import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext"; 
import { Loader2 } from "lucide-react";
import "./menuSoir.css";

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
  showInMenuSoir: boolean;
}

export default function MenuSoir() {
  const { addToCart, removeFromCart, isInCart } = useCart();
  
  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Plat["category"] | "Tous">("Tous");
  
  const categories: (Plat["category"] | "Tous")[] = ["Tous", "Formule", "Entrée", "Plat", "Dessert", "Boisson"];
  
  useEffect(() => {
    const fetchMenuSoir = async () => {
      try {
        const response = await axios.get(API_URL);
        const menuNocturne = response.data.data.filter((p: Plat) => p.showInMenuSoir === true);
        setPlats(menuNocturne);
      } catch (error) {
        console.error("Erreur chargement menu soir:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuSoir();
  }, []);

  const platsFiltres = filter === "Tous" 
    ? plats 
    : plats.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="menu-soir-loading">
        <Loader2 className="animate-spin" size={40} color="#d4af37" />
        <p>Mise en place de l'expérience nocturne...</p>
      </div>
    );
  }

  return (
    <section className="menu-soir-section">
      <div className="menu-header-soir">
        <div className="header-overlay-dark"></div>
        <div className="header-content-wrapper">
          <div className="header-text-shield-soir">
            <div className="header-seal-gold">S</div>
            <span className="menu-badge-gold">L'Expérience Nocturne</span>
            <h2 className="menu-main-title-soir">Menu Du Soir</h2>
            <div className="header-ornament-line"></div>
          </div>
        </div>
      </div>

      <div className="menu-filtres-soir">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn-soir ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "Tous" ? "Tout voir" : `${cat}s`}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {platsFiltres.length > 0 ? (
          platsFiltres.map(plat => {
            const alreadyInCart = isInCart(plat._id);

            return (
              <div key={plat._id} className="menu-card-outer soir-variant">
                <div className="menu-card-inner dark-theme">
                  {plat.category === "Formule" && (
                    <div className="formula-badge-soir">Menu Signature</div>
                  )}
                  
                  {plat.category === "Boisson" && (
                    <div className="formula-badge-soir drink-badge">Cave & Rafraîchissements</div>
                  )}

                  <div className="menu-image-container">
                    {plat.image ? (
                      <img src={plat.image} alt={plat.name} className="menu-img" />
                    ) : (
                      <div className="placeholder-soir">
                        {plat.category === "Boisson" ? "Sommelier" : "Signature"}
                      </div>
                    )}
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
                        className={`btn-add-soir ${alreadyInCart ? "in-cart" : ""}`} 
                        onClick={() => addToCart({
                          id: plat._id,
                          name: plat.name,
                          price: plat.price,
                          image: plat.image
                        })}
                        disabled={alreadyInCart}
                      >
                        {alreadyInCart ? "Dans votre sélection" : "Ajouter à la dégustation"}
                      </button>

                      {alreadyInCart && (
                        <button 
                          className="btn-remove-soir" 
                          onClick={() => removeFromCart(plat._id)}
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
          })
        ) : (
          /* --- MESSAGE PRESTIGIEUX POUR CARTE VIDE --- */
          <div className="empty-menu-container">
            <div className="empty-menu-content">
              <div className="empty-icon">✧</div>
              <h3>Une Expérience en Préparation</h3>
              <div className="empty-separator"></div>
              <p>
                Notre Chef peaufine actuellement la sélection de ce soir pour vous offrir 
                un moment d'exception.
              </p>
              <p className="empty-footer">La carte sera dévoilée très prochainement.</p>
              <button onClick={() => window.location.reload()} className="refresh-btn">
                Actualiser la carte
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}