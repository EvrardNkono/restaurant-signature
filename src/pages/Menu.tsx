import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext"; 
import { Loader2, X, Trash2, ArrowRight, Utensils, GlassWater } from "lucide-react"; 
import "./menu.css";

const isLocal = window.location.hostname === "localhost";
// On utilise le filtre ?public=true pour ne récupérer que les catégories actives
const API_URL = isLocal 
  ? "http://localhost:5000/api/menu?public=true" 
  : "https://signature.abbadevelop.net/api/menu?public=true";

interface Category {
  _id: string;
  name: string;
  univers: "Cuisine" | "Boissons";
  active: boolean;
}

interface Plat {
  _id: string;
  name: string;
  price: number;
  category: Category; // Objet complet via populate
  description: string;
  image: string;
  showInMenuJour: boolean;
}

export default function Menu() {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [filter, setFilter] = useState<string>("Tous");
  const [flippedId, setFlippedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuDuJour = async () => {
      try {
        const response = await axios.get(API_URL);
        // Filtrage spécifique pour le menu du midi / du jour
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

  // --- LOGIQUE DYNAMIQUE DES FILTRES (SYNCHRONISÉE AVEC LA CARTE) ---
  const currentCategories = [
    "Tous",
    ...new Set(
      plats
        .filter(p => p.category?.univers === univers)
        .map(p => p.category?.name)
        .filter(Boolean)
    )
  ];

  // --- LOGIQUE DE FILTRAGE DES PLATS ---
  const platsFiltres = plats.filter(p => {
    const matchUnivers = p.category?.univers === univers;
    if (!matchUnivers) return false;

    if (filter === "Tous") return true;
    return p.category?.name === filter;
  });

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

      <div className="univers-selector-container">
        <div className="univers-selector">
          <button 
            className={`univers-btn ${univers === "Cuisine" ? "active" : ""}`}
            onClick={() => { setUnivers("Cuisine"); setFilter("Tous"); }}
          >
            <Utensils size={18} /> La Table
          </button>
          <button 
            className={`univers-btn ${univers === "Boissons" ? "active" : ""}`}
            onClick={() => { setUnivers("Boissons"); setFilter("Tous"); }}
          >
            <GlassWater size={18} /> La Cave & Jus
          </button>
        </div>
      </div>

      <div className="menu-filtres-container">
        <div className="scroll-hint-mobile">
          <span>Explorez nos suggestions</span>
          <ArrowRight size={14} className="arrow-pulse" />
        </div>

        <div className="menu-filtres-track">
          <div className="menu-filtres-list">
            {currentCategories.map((cat, idx) => (
              <button
                key={idx}
                className={`filter-btn ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="menu-filtres-decoration"></div>

      <div className="menu-grid">
        {platsFiltres.length > 0 ? (
          platsFiltres.map(plat => {
            const alreadyInCart = isInCart(plat._id);
            const isFlipped = flippedId === plat._id;

            return (
              <div key={plat._id} className="menu-card-outer">
                <div className="gold-thick-border"></div>
                <div className={`menu-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                  
                  {/* RECTO */}
                  <div className="card-face card-front">
                    {plat.category?.name === "Formule" && <div className="formula-tag">Menu Complet</div>}
                    <div className="menu-image-container">
                      {plat.image ? <img src={plat.image} alt={plat.name} className="menu-img" /> : <div className="placeholder-img">Signature</div>}
                      <div className="price-badge-luxury"><span>{plat.price}€</span></div>
                    </div>

                    <div className="menu-details-terracotta">
                      <div className="title-row">
                        <h3>{plat.name}</h3>
                        <div className="title-underline-gold"></div>
                      </div>
                      
                      <button className="view-details-btn" onClick={() => setFlippedId(plat._id)}>
                        Découvrir la composition
                      </button>

                      <div className="card-actions">
                        <button 
                          className={`add-to-cart-btn ${alreadyInCart ? "in-cart" : ""}`} 
                          onClick={() => addToCart({ ...plat, id: plat._id })} 
                          disabled={alreadyInCart}
                        >
                          <span className="btn-text">{alreadyInCart ? "✓ Sélectionné" : "Ajouter au panier"}</span>
                        </button>
                      </div>
                      <div className="card-footer-ornament-gold">✦ ✦ ✦</div>
                    </div>
                  </div>

                  {/* VERSO */}
                  <div className="card-face card-back">
                    <button className="close-back-btn" onClick={() => setFlippedId(null)}>
                      <X size={20} />
                    </button>
                    <div className="back-content">
                      <div className="back-header-row">
                        <div className="back-circle-img">
                           {plat.image ? <img src={plat.image} alt={plat.name} /> : <div className="circle-placeholder">S</div>}
                        </div>
                        <div className="back-header-text">
                          <h4>{plat.name}</h4>
                          <span className="back-price-tag">{plat.price}€</span>
                        </div>
                      </div>
                      <div className="small-separator-gold"></div>
                      <div className="back-body">
                        <span className="back-category-label">{plat.category?.name}</span>
                        <p className="description-full">{plat.description}</p>
                      </div>
                      <div className="back-footer">
                        {alreadyInCart ? (
                          <button className="remove-btn-verso" onClick={() => { removeFromCart(plat._id); setFlippedId(null); }}>
                            <Trash2 size={16} /> Retirer du panier
                          </button>
                        ) : (
                          <button className="add-to-cart-btn" onClick={() => { addToCart({ ...plat, id: plat._id }); setFlippedId(null); }}>
                            Choisir ce plat
                          </button>
                        )}
                      </div>
                      <div className="card-footer-ornament-gold">✦ ✦ ✦</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-menu-container">
            <div className="empty-menu-content">
              <p>Cette sélection n'est pas disponible aujourd'hui.</p>
              <button className="refresh-btn" onClick={() => {setFilter("Tous"); setUnivers("Cuisine")}}>Retour à La Table</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}