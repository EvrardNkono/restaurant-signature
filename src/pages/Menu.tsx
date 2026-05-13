import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCart } from "../context/CartContext"; 
import { 
  Loader2, X, Utensils, GlassWater, 
  Check, PlusCircle, Sparkles, MinusCircle,
  Clock, CreditCard, Gift, Flame, Crown,
  Star, Eye, Award, Search, ArrowRight,
  MapPin, Phone, Mail, Facebook, Instagram, Twitter
} from "lucide-react"; 
import "./menu.css";

// --- CONFIGURATION ---
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/menu?public=true`;
const SUPP_API = `${BASE_URL}/supplements?public=true`;

// --- COMPOSANT VOYANT DE STATUT (TRACKING) ---
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string, color: string, icon: any, gradient?: string, pulse?: boolean }> = {
    in_cart: { 
      label: "À régler", 
      color: "#E74C3C",
      gradient: "linear-gradient(135deg, #E74C3C, #C0392B)",
      icon: <CreditCard size={12} />,
      pulse: true 
    },
    pending: { 
      label: "En attente", 
      color: "#2D2422",
      gradient: "linear-gradient(135deg, #2D2422, #1a1312)",
      icon: <Clock size={12} />,
      pulse: true
    },
    cooking: { 
      label: "En cuisine", 
      color: "#B86B4A",
      gradient: "linear-gradient(135deg, #B86B4A, #8B4513)",
      icon: <Flame size={12} />, 
      pulse: true 
    },
    done: { 
      label: "Prêt", 
      color: "#D4AF37",
      gradient: "linear-gradient(135deg, #D4AF37, #B8860B)",
      icon: <Sparkles size={12} /> 
    },
  };

  const config = statusConfig[status] || { 
    label: "Reçu", 
    color: "#34495e",
    gradient: "linear-gradient(135deg, #34495e, #2c3e50)",
    icon: <Check size={12} /> 
  };

  return (
    <div className="order-status-tag" style={{ background: config.gradient || config.color }}>
      <div className="status-icon-wrapper">
        {config.icon}
      </div>
      <span>{config.label}</span>
      {config.pulse && <div className="status-pulse-ring" />}
    </div>
  );
};

// --- COMPOSANT OFFRE SPÉCIALE ---
const OfferBadge = ({ quantity }: { quantity: number }) => (
  <div className="offer-badge-premium">
    <Gift size={10} />
    <span>Offre x{quantity}</span>
  </div>
);

// --- COMPOSANT NOTE GASTRONOMIQUE ---
const GastronomicNote = ({ note }: { note: number }) => (
  <div className="gastro-note">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={10} 
        className={i < note ? "star-filled" : "star-empty"}
        fill={i < note ? "#D4AF37" : "none"}
      />
    ))}
  </div>
);

const scrollToDrawer = (id: string) => {
  setTimeout(() => {
    const element = document.getElementById(`drawer-${id}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      element.classList.add('drawer-highlight');
      setTimeout(() => element.classList.remove('drawer-highlight'), 1000);
    }
  }, 100);
};

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
  showInMenuJour: boolean;
  showInMenuSoir: boolean;
  hasAccompaniment: boolean;
  accompaniments: Accompaniment[]; 
  allowSupplements: boolean;
  offer?: {
    enabled: boolean;
    requiredQuantity: number;
    offerPrice: number;
  };
  gastronomicNote?: number;
  preparationTime?: number;
  calories?: number;
  spicy?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

interface Supplement {
  _id: string;
  name: string;
  price: number;
  active: boolean;
  category?: string;
}

export default function Menu() {
  const { 
    cart, 
    addToCart, 
    addSupplementToLine, 
    removeSupplementFromLine, 
    removeFromCart, 
    updateLineAccompaniment,
    getItemQuantity
  } = useCart();

  const clientId = localStorage.getItem("signature_client_id");
  const [period] = useState<"JOUR" | "SOIR">("JOUR"); 
  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [filter, setFilter] = useState<string>("Tous");
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [selectingAccId, setSelectingAccId] = useState<string | null>(null);
  const [addedSuppId, setAddedSuppId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  const isAnyDrawerOpen = selectingAccId !== null;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Détection du mobile pour l'overlay
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermeture du drawer au clic en dehors sur mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isAnyDrawerOpen && isMobile) {
        const drawer = document.querySelector('.customization-drawer.open');
        const target = e.target as HTMLElement;
        if (drawer && !drawer.contains(target) && !target.closest('.btn-add-premium')) {
          setSelectingAccId(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAnyDrawerOpen, isMobile]);

  const triggerBounceHint = useCallback(() => {
    const scrollContainer = document.querySelector('.drawer-body-scroll');
    if (scrollContainer) {
      scrollContainer.classList.remove('hint-active');
      void (scrollContainer as HTMLElement).offsetWidth; 
      scrollContainer.classList.add('hint-active');
      setTimeout(() => scrollContainer.classList.remove('hint-active'), 800);
    }
  }, []);

  useEffect(() => {
    if (selectingAccId) {
      const timer = setTimeout(() => triggerBounceHint(), 600);
      return () => clearTimeout(timer);
    }
  }, [selectingAccId, triggerBounceHint]);

  // --- DATA FETCHERS ---
  const { data: allPlats, isLoading: isLoadingMenu } = useQuery<Plat[]>({
    queryKey: ['full-catalog'],
    queryFn: async () => {
      const response = await axios.get(API_URL);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 30, 
  });

  const { data: supplementsList, isLoading: isLoadingSupps } = useQuery<Supplement[]>({
    queryKey: ['menu-supplements'],
    queryFn: async () => {
      const response = await axios.get(SUPP_API);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: activeOrders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["active-orders", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const response = await axios.get(`${BASE_URL}/orders/track/${clientId}`);
      return response.data.orders || [];
    },
    refetchInterval: 10000, 
    enabled: !!clientId
  });

  useEffect(() => {
    if (clientId) refetchOrders();
  }, [clientId, cart.length, refetchOrders]);

  // --- FILTRAGE DYNAMIQUE ---
  const platsDeLaPeriode = useMemo(() => {
    if (!allPlats) return [];
    return period === "JOUR" 
      ? allPlats.filter(p => p.showInMenuJour) 
      : allPlats.filter(p => p.showInMenuSoir);
  }, [allPlats, period]);

  const supplementsDisponibles = useMemo(() => 
    (supplementsList?.filter(s => s.active) || [])
      .sort((a, b) => a.name.localeCompare(b.name)), 
  [supplementsList]);

  const currentCategories = useMemo(() => [
    "Tous",
    ...Array.from(new Set(
      platsDeLaPeriode
        .filter(p => p.category?.univers === univers)
        .map(p => p.category?.name)
        .filter(Boolean)
    ))
  ], [platsDeLaPeriode, univers]);

  const platsFiltres = useMemo(() => {
    let filtered = platsDeLaPeriode.filter(p => {
      const matchUnivers = p.category?.univers === univers;
      if (!matchUnivers) return false;
      if (filter === "Tous") return true;
      return p.category?.name === filter;
    });
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [platsDeLaPeriode, univers, filter, searchTerm]);

  // --- ACTIONS ---
  const handleAddClick = (plat: Plat, currentQty: number) => {
    if (isAnyDrawerOpen) return;

    const result = addToCart(
      { 
        id: plat._id, 
        name: plat.name, 
        price: plat.price, 
        image: plat.image,
        type: period, 
        supplements: [],
        offer: plat.offer 
      }, 
      period
    );

    if (result === "LOCK_ERROR") {
      const toast = document.createElement('div');
      toast.className = 'custom-toast error';
      toast.innerHTML = `<span>⚠️ Votre panier contient déjà des produits d'un autre service.</span>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return;
    }

    const activeAccs = plat.accompaniments?.filter(a => a.active) || [];
    const hasSupps = plat.allowSupplements;
    const willHaveOffer = plat.offer?.enabled && (currentQty + 1) >= plat.offer.requiredQuantity;

    if (activeAccs.length > 0 || hasSupps || willHaveOffer) {
      setSelectingAccId(plat._id);
      scrollToDrawer(plat._id);
    } else {
      const toast = document.createElement('div');
      toast.className = 'custom-toast success';
      toast.innerHTML = `<span>✓ ${plat.name} ajouté au panier</span>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const handleRemoveOne = (itemsInCart: any[]) => {
    if (itemsInCart.length > 0) {
      const lastItem = itemsInCart[itemsInCart.length - 1];
      removeFromCart(lastItem.cartItemId);
      const toast = document.createElement('div');
      toast.className = 'custom-toast info';
      toast.innerHTML = `<span>✓ Article retiré du panier</span>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  if (isLoadingMenu) {
    return (
      <div className="menu-loading-premium">
        <div className="loading-content">
          <div className="loading-logo">S</div>
          <Loader2 className="animate-spin" size={50} color="#D4AF37" />
          <p>Signature prépare sa carte gastronomique...</p>
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="menu-section-premium">
      {/* Overlay adapté selon mobile/desktop */}
      {isAnyDrawerOpen && (
        <div 
          className={isMobile ? "global-drawer-overlay-mobile" : "global-drawer-overlay-premium"} 
          onClick={() => setSelectingAccId(null)} 
        />
      )}

      {/* HERO SECTION PREMIUM */}
      <div className="menu-hero-premium">
        <div className="hero-backdrop"></div>
        <div className="hero-text-overlay"></div>
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{ '--delay': `${i * 0.5}s`, '--x': `${Math.random() * 100}%` } as React.CSSProperties} />
          ))}
        </div>
        <div className="hero-content-premium">
          <div className="hero-floating-elements">
            <Crown className="floating-icon crown" size={30} />
            <Star className="floating-icon star" size={20} />
            <Sparkles className="floating-icon sparkle" size={16} />
          </div>
          <div className="hero-badge-premium">
            <Award size={14} />
            <span>Étoilé au Guide Michelin 2025</span>
          </div>
          <h1 className="hero-title-premium">
            L'Art de la 
            <span className="gold-text"> Table Signature</span>
          </h1>
          <div className="hero-separator-premium">
            <div className="separator-line"></div>
            <Utensils size={24} className="separator-icon" />
            <div className="separator-line"></div>
          </div>
          <p className="hero-description-premium">
            Une symphonie de saveurs où chaque met raconte une histoire unique
          </p>
          <div className="hero-stats-premium">
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Plats Signature</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Produits Frais</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">⭐ 4.9</span>
              <span className="stat-label">Notes Clients</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator-premium">
          <span>Découvrir la carte</span>
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
        </div>
      </div>

      {/* BARRE DE RECHERCHE & FILTRES */}
      <div className="controls-bar-premium">
        <div className="search-bar-premium">
          <input 
            type="text"
            placeholder="Rechercher un plat, une saveur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-premium"
          />
          <button className="search-btn-premium">
            <Search size={18} />
          </button>
        </div>

        <div className="univers-selector-premium">
          <button 
            className={`univers-btn-premium ${univers === "Cuisine" ? "active" : ""} ${isAnyDrawerOpen ? "disabled" : ""}`} 
            onClick={() => !isAnyDrawerOpen && setUnivers("Cuisine")}
          >
            <Utensils size={18} />
            <span>Carte & Saveurs</span>
            {univers === "Cuisine" && <div className="active-indicator" />}
          </button>
          <button 
            className={`univers-btn-premium ${univers === "Boissons" ? "active" : ""} ${isAnyDrawerOpen ? "disabled" : ""}`} 
            onClick={() => !isAnyDrawerOpen && setUnivers("Boissons")}
          >
            <GlassWater size={18} />
            <span>Cave & Spiritueux</span>
            {univers === "Boissons" && <div className="active-indicator" />}
          </button>
        </div>
      </div>

      {/* CATÉGORIES FILTRES */}
      <div className="categories-bar-premium">
        <div className="categories-scroll-premium">
          {currentCategories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`category-chip-premium ${filter === cat ? "active" : ""}`} 
              onClick={() => !isAnyDrawerOpen && setFilter(cat)}
            >
              <span>{cat}</span>
              {filter === cat && <div className="chip-glow" />}
            </button>
          ))}
        </div>
      </div>

      {/* RÉSULTATS DE RECHERCHE */}
      {searchTerm && (
        <div className="search-results-premium">
          <span>{platsFiltres.length} résultat(s) trouvé(s)</span>
          <button onClick={() => setSearchTerm("")}>Effacer</button>
        </div>
      )}

      {/* GRILLE DES PLATS */}
      <div className="menu-grid-premium">
        {platsFiltres.length > 0 ? (
          platsFiltres.map((plat, index) => {
            const quantityInCart = getItemQuantity(plat._id);
            const itemsInCart = cart.filter((i) => i.id === plat._id);
            const lastItemAdded = itemsInCart[itemsInCart.length - 1];
            const isFlipped = flippedId === plat._id;
            const isExpanding = selectingAccId === plat._id;
            const isHovered = hoveredCard === plat._id;
            const activeAccs = plat.accompaniments?.filter((a) => a.active) || [];

            let orderMatch = activeOrders.find((order: any) =>
              order.items.some((item: any) => item.productId === plat._id)
            );

            let currentStatus = null;
            if (orderMatch) {
              const status = orderMatch.status;
              const lastUpdate = new Date(orderMatch.updatedAt || orderMatch.createdAt).getTime();
              const now = Date.now();
              if (status !== "archived" && !(status === "done" && now - lastUpdate > 600000)) {
                currentStatus = status;
              }
            }
            if (!currentStatus && quantityInCart > 0) currentStatus = "in_cart";

            return (
              <div 
                key={plat._id} 
                className={`menu-card-premium ${isExpanding ? "expanded" : ""} ${isHovered ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCard(plat._id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`card-inner-premium ${isFlipped ? "flipped" : ""}`}>
                  
                  {/* FACE AVANT */}
                  <div className="card-front-premium">
                    <div className="card-image-section">
                      {currentStatus && <OrderStatusBadge status={currentStatus} />}
                      {plat.offer?.enabled && <OfferBadge quantity={plat.offer.requiredQuantity} />}
                      {plat.spicy && <div className="spicy-badge"><Flame size={12} /> Épicé</div>}
                      {plat.vegetarian && <div className="veg-badge">🌱 Végétarien</div>}
                      
                      <div className="image-wrapper">
                        {plat.image ? (
                          <img src={plat.image} alt={plat.name} className="card-image" loading="lazy" />
                        ) : (
                          <div className="image-placeholder">S</div>
                        )}
                        <div className="image-overlay-gradient"></div>
                      </div>
                      
                      <div className="price-tag-premium">
                        <span className="price-currency">€</span>
                        <span className="price-value">{plat.price}</span>
                      </div>
                      
                      <button 
                        className="quick-view-btn"
                        onClick={() => setQuickViewId(quickViewId === plat._id ? null : plat._id)}
                      >
                        <Eye size={16} />
                      </button>
                    </div>

                    <div className="card-info-premium">
                      <div className="card-header">
                        <div className="category-badge">{plat.category?.name}</div>
                        {plat.gastronomicNote && <GastronomicNote note={plat.gastronomicNote} />}
                      </div>
                      
                      <h3 className="plat-name-premium">{plat.name}</h3>
                      <div className="title-decoration"></div>
                      
                      <p className="plat-description-premium">
                        {plat.description.length > 100 
                          ? `${plat.description.substring(0, 100)}...` 
                          : plat.description}
                      </p>
                      
                      <div className="card-actions-premium">
                        {quantityInCart > 0 && !isExpanding && (
                          <button className="btn-remove-premium" onClick={() => handleRemoveOne(itemsInCart)}>
                            <MinusCircle size={18} />
                            <span>Retirer</span>
                          </button>
                        )}
                        <button
                          className={`btn-add-premium ${isExpanding ? "configuring" : ""} ${quantityInCart > 0 ? "has-items" : ""}`}
                          onClick={() => handleAddClick(plat, quantityInCart)}
                        >
                          {isExpanding ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              <span>Configuration...</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle size={18} />
                              <span>{quantityInCart > 0 ? `Ajouter (${quantityInCart})` : "Ajouter"}</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <button className="details-trigger" onClick={() => setFlippedId(plat._id)}>
                        <span>Détails</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* TIROIR DE PERSONNALISATION */}
<div id={`drawer-${plat._id}`} className={`customization-drawer ${isExpanding ? "open" : ""}`}>
  <div className="drawer-header-premium">
    <div className="drawer-title-premium">
      <Sparkles size={16} color="#D4AF37" />
      <span>Personnalisez votre expérience</span>
    </div>
    <button className="drawer-close-premium" onClick={() => setSelectingAccId(null)}>
      <X size={18} />
    </button>
  </div>

                      <div className="drawer-content-premium">
                        {/* OFFRE DYNAMIQUE */}
                        {plat.offer?.enabled && quantityInCart >= plat.offer.requiredQuantity && (() => {
                          const nbLots = Math.floor(quantityInCart / plat.offer.requiredQuantity);
                          const reste = quantityInCart % plat.offer.requiredQuantity;
                          const prixPromo = (nbLots * plat.offer.offerPrice) + (reste * plat.price);
                          const economie = (plat.price * quantityInCart) - prixPromo;

                          return (
                            <div className="offer-section-premium">
                              <div className="offer-header">
                                <Gift size={18} />
                                <span>Offre Signature Activée !</span>
                              </div>
                              <p className="offer-description">
                                {quantityInCart} {plat.name} → <strong>{prixPromo.toFixed(2)}€</strong>
                              </p>
                              {economie > 0 && (
                                <div className="savings-premium">Économie : {economie.toFixed(2)}€</div>
                              )}
                            </div>
                          );
                        })()}

                        {/* ACCOMPAGNEMENTS */}
                        {activeAccs.length > 0 && lastItemAdded && (
                          <div className="drawer-section-premium">
                            <label className="section-label">Accompagnement</label>
                            <div className="options-grid-premium">
                              {["Aucun", "Standard", ...activeAccs.map(a => a.name)].map(accName => (
                                <button
                                  key={accName}
                                  className={`option-chip ${lastItemAdded.chosenAccompaniment === accName ? "selected" : ""}`}
                                  onClick={() => {
                                    updateLineAccompaniment(lastItemAdded.cartItemId, accName);
                                    triggerBounceHint();
                                  }}
                                >
                                  {accName}
                                  {lastItemAdded.chosenAccompaniment === accName && <Check size={12} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SUPPLÉMENTS */}
                        {plat.allowSupplements && lastItemAdded && (
                          <div className="drawer-section-premium">
                            <label className="section-label">Extras & Suppléments</label>
                            <div className="supplements-grid-premium">
                              {isLoadingSupps ? (
                                <div className="supp-loader"><Loader2 className="animate-spin" size={24} /></div>
                              ) : (
                                supplementsDisponibles.map(supp => {
                                  const count = lastItemAdded.supplements?.filter(s => s.id === supp._id).length || 0;
                                  return (
                                    <div key={supp._id} className="supplement-card-premium">
                                      <div className="supp-info-premium">
                                        <span className="supp-name">{supp.name}</span>
                                        <span className="supp-price">+{supp.price}€</span>
                                      </div>
                                      <div className="supp-controls">
                                        {count > 0 && (
                                          <button onClick={() => removeSupplementFromLine(lastItemAdded.cartItemId, supp._id)}>
                                            <MinusCircle size={18} />
                                          </button>
                                        )}
                                        {count > 0 && <span className="supp-count">{count}</span>}
                                        <button onClick={() => {
                                          addSupplementToLine(lastItemAdded.cartItemId, {
                                            id: supp._id,
                                            name: supp.name,
                                            price: supp.price,
                                          });
                                          setAddedSuppId(supp._id);
                                          triggerBounceHint();
                                          setTimeout(() => setAddedSuppId(null), 600);
                                        }}>
                                          <PlusCircle size={18} className={addedSuppId === supp._id ? "added" : ""} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}

                        <button className="drawer-confirm-premium" onClick={() => setSelectingAccId(null)}>
                          <Check size={18} />
                          <span>Valider ma sélection</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FACE ARRIÈRE - DÉTAILS */}
                  <div className="card-back-premium">
                    <button className="back-close-premium" onClick={() => setFlippedId(null)}>
                      <X size={18} />
                    </button>
                    <div className="back-content-premium">
                      <div className="back-image">
                        <img src={plat.image} alt={plat.name} />
                      </div>
                      <div className="back-info">
                        <div className="back-category">{plat.category?.name}</div>
                        <h4>{plat.name}</h4>
                        <div className="back-price">{plat.price}€</div>
                        <div className="back-divider"></div>
                        <p className="back-description">{plat.description}</p>
                        
                        {plat.preparationTime && (
                          <div className="back-meta">
                            <Clock size={14} />
                            <span>Temps de préparation : {plat.preparationTime} min</span>
                          </div>
                        )}
                        
                        <div className="back-actions">
                          <button className="back-order-btn" onClick={() => {
                            setFlippedId(null);
                            handleAddClick(plat, quantityInCart);
                          }}>
                            Commander
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state-premium">
            <div className="empty-animation">
              <Utensils size={60} />
              <Sparkles className="empty-sparkle" size={20} />
            </div>
            <h3>Aucun résultat trouvé</h3>
            <p>Nous n'avons pas trouvé de plat correspondant à votre recherche</p>
            <button onClick={() => { setFilter("Tous"); setSearchTerm(""); }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

 
    </section>
  );
}