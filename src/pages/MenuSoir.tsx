import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCart } from "../context/CartContext"; 
import { Loader2, X, Trash2, Utensils, GlassWater, ArrowRight, Check, ListChecks } from "lucide-react"; 
import "./menuSoir.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/menu?public=true" 
  : "https://signature.abbadevelop.net/api/menu?public=true";

// --- INTERFACES ---
interface Category {
  _id: string;
  name: string;
  univers: "Cuisine" | "Boissons";
  active: boolean;
}

interface Accompaniment {
  _id: string;
  name: string;
  active: boolean;
}

interface Plat {
  _id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  showInMenuSoir: boolean;
  hasAccompaniment: boolean;
  accompaniments: Accompaniment[]; 
}

// Fonction de fetch synchronisée avec Home, Carte et Menu
const fetchFullCatalog = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

export default function MenuSoir() {
  const { addToCart, removeFromCart, isInCart } = useCart();

  // --- RÉCUPÉRATION DU CACHE ---
  const { data: allPlats, isLoading } = useQuery<Plat[]>({
    queryKey: ['full-catalog'],
    queryFn: fetchFullCatalog,
    staleTime: 1000 * 60 * 30, // 30 minutes de cache
  });

  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [filter, setFilter] = useState<string>("Tous");
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [selectingAccId, setSelectingAccId] = useState<string | null>(null);

  // --- FILTRAGE CÔTÉ CLIENT ---
  const platsDuSoir = allPlats?.filter((p) => p.showInMenuSoir === true) || [];

  const currentCategories = [
    "Tous",
    ...new Set(
      platsDuSoir
        .filter(p => p.category?.univers === univers)
        .map(p => p.category?.name)
        .filter(Boolean)
    )
  ];

  const platsFiltres = platsDuSoir.filter(p => {
    const matchUnivers = p.category?.univers === univers;
    if (!matchUnivers) return false;
    if (filter === "Tous") return true;
    return p.category?.name === filter;
  });

  // --- GESTION DE L'AJOUT ---
  const handleAddClick = (plat: Plat) => {
    const activeAccs = plat.accompaniments?.filter(a => a.active) || [];
    if (activeAccs.length > 0) {
      setSelectingAccId(plat._id);
    } else {
      addToCart({ ...plat, id: plat._id });
    }
  };

  const handleSelectAccompaniment = (plat: Plat, accName: string) => {
    addToCart({ ...plat, id: plat._id, chosenAccompaniment: accName });
    setSelectingAccId(null);
    setFlippedId(null);
  };

  if (isLoading) {
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

      <div className="univers-selector-container-soir">
        <div className="univers-selector-soir">
          <button className={`univers-btn-soir ${univers === "Cuisine" ? "active" : ""}`} onClick={() => { setUnivers("Cuisine"); setFilter("Tous"); }}>
            <Utensils size={18} /> La Table
          </button>
          <button className={`univers-btn-soir ${univers === "Boissons" ? "active" : ""}`} onClick={() => { setUnivers("Boissons"); setFilter("Tous"); }}>
            <GlassWater size={18} /> La Cave
          </button>
        </div>
      </div>

      <div className="menu-filtres-soir-container">
        <div className="scroll-hint-mobile-soir">
          <span>Découvrez nos suggestions</span>
          <ArrowRight size={14} className="arrow-pulse-soir" />
        </div>

        <div className="menu-filtres-track-soir">
          <div className="menu-filtres-list-soir">
            {currentCategories.map((cat, idx) => (
              <button key={idx} className={`filter-btn-soir ${filter === cat ? "active" : ""}`} onClick={() => setFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="menu-grid">
        {platsFiltres.length > 0 ? (
          platsFiltres.map(plat => {
            const alreadyInCart = isInCart(plat._id);
            const isFlipped = flippedId === plat._id;
            const isExpanding = selectingAccId === plat._id;
            const activeAccs = plat.accompaniments?.filter(a => a.active) || [];

            return (
              <div key={plat._id} className={`menu-card-outer soir-variant ${isExpanding ? "is-expanded" : ""}`}>
                <div className={`menu-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                  
                  {/* RECTO */}
                  <div className="card-face-soir card-front-soir">
                    {plat.category?.name === "Formule" && <div className="formula-badge-soir">Menu Signature</div>}
                    <div className="menu-image-container">
                      {plat.image ? <img src={plat.image} alt={plat.name} className="menu-img" /> : <div className="placeholder-soir">Signature</div>}
                      <div className="price-tag-evening"><span>{plat.price}€</span></div>
                    </div>

                    <div className="details-container-soir">
                      <h3>{plat.name}</h3>
                      <div className="gold-separator"></div>
                      <p className="description-preview-soir">{plat.description}</p>

                      <button className="view-details-btn-soir" onClick={() => setFlippedId(plat._id)}>
                        Voir plus...
                      </button>

                      <div className="card-actions">
                        <button 
                          className={`btn-add-soir ${alreadyInCart ? "in-cart" : ""}`} 
                          onClick={() => handleAddClick(plat)} 
                          disabled={alreadyInCart && !isExpanding}
                        >
                          {alreadyInCart ? "✓ Sélectionné" : "Ajouter à la dégustation"}
                        </button>
                      </div>
                      <div className="card-footer-star">★ ★ ★</div>
                    </div>

                    {/* TIROIR D'ACCOMPAGNEMENTS */}
                    <div className={`acc-selection-drawer ${isExpanding ? "open" : ""}`}>
                       <div className="drawer-header">
                         <div className="drawer-title">
                            <ListChecks size={14} /> <span>Accompagnement au choix</span>
                         </div>
                         <X size={18} className="close-drawer" onClick={(e) => { e.stopPropagation(); setSelectingAccId(null); }} />
                       </div>
                       <div className="drawer-options">
                          <button 
                            className="acc-option-btn default-option"
                            onClick={() => handleSelectAccompaniment(plat, "Standard / Sans")}
                          >
                            Sans accompagnement
                          </button>

                          {activeAccs.map(acc => (
                            <button 
                              key={acc._id} 
                              className="acc-option-btn"
                              onClick={() => handleSelectAccompaniment(plat, acc.name)}
                            >
                              <Check size={14} /> {acc.name}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>

                  {/* VERSO */}
                  <div className="card-face-soir card-back-soir">
                    <button className="close-back-btn-soir" onClick={() => setFlippedId(null)}>
                      <X size={20} />
                    </button>
                    <div className="back-content-soir">
                      <div className="back-header-soir">
                        <div className="back-circle-img-soir">
                           {plat.image ? <img src={plat.image} alt={plat.name} /> : <div className="circle-placeholder-soir">S</div>}
                        </div>
                        <div className="back-title-group">
                          <h4>{plat.name}</h4>
                          <span className="back-price-soir">{plat.price}€</span>
                        </div>
                      </div>
                      <div className="gold-separator-small"></div>
                      <div className="back-body-soir">
                        <span className="back-label-soir">{plat.category?.name}</span>
                        <p className="full-description-soir">{plat.description}</p>
                      </div>
                      <div className="back-footer-soir">
                        {alreadyInCart ? (
                          <button className="btn-remove-soir-verso" onClick={() => { removeFromCart(plat._id); setFlippedId(null); }}>
                            <Trash2 size={16} /> Retirer
                          </button>
                        ) : (
                          <button className="btn-add-soir" onClick={() => handleAddClick(plat)}>
                            Sélectionner
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-menu-container">
            <p>Aucun délice disponible dans cette catégorie ce soir.</p>
            <button className="refresh-btn-soir" onClick={() => {setFilter("Tous"); setUnivers("Cuisine")}}>Retour à la Table</button>
          </div>
        )}
      </div>
    </section>
  );
}