import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCart } from "../context/CartContext"; 
import { 
  Loader2, X, Utensils, GlassWater, 
  Check, PlusCircle, Sparkles, MinusCircle, Trash2,
  Clock, CreditCard
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
  const statusConfig: Record<string, { label: string, color: string, icon: any, pulse?: boolean }> = {
    in_cart: { 
      label: "À régler", 
      color: "rgba(231, 76, 60, 0.9)", // Rouge élégant
      icon: <CreditCard size={12} />,
      pulse: true 
    },
    pending: { 
      label: "En attente", 
      color: "rgba(45, 36, 34, 0.9)", // Anthracite Signature
      icon: <Clock size={12} />,
      pulse: true
    },
    cooking: { 
      label: "En cuisine", 
      color: "rgba(184, 107, 74, 0.95)", // Terracotta Signature
      icon: <Utensils size={12} />, 
      pulse: true 
    },
    done: { 
      label: "Prêt", 
      color: "rgba(212, 175, 55, 0.95)", // Or Signature
      icon: <Sparkles size={12} /> 
    },
  };

  const config = statusConfig[status] || { label: "Reçu", color: "#34495e", icon: <Check size={12} /> };

  return (
    <div 
      className={`order-status-tag ${config.pulse ? "pulse-active" : ""}`} 
      style={{ backgroundColor: config.color }}
    >
      <div className={config.pulse ? "status-icon-anim" : ""}>
        {config.icon}
      </div>
      <span>{config.label}</span>
    </div>
  );
};

const scrollToDrawer = (id: string) => {
  setTimeout(() => {
    const element = document.getElementById(`drawer-${id}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
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
  // AJOUTE CECI :
  offer?: {
    enabled: boolean;
    requiredQuantity: number;
    offerPrice: number;
  };
}

interface Supplement {
  _id: string;
  name: string;
  price: number;
  active: boolean;
}

export default function Menu() {
  const { 
    cart, 
    addToCart, 
    addSupplementToLine, 
    removeSupplementFromLine, 
    removeFromCart, 
    updateLineAccompaniment 
  } = useCart();

  const clientId = localStorage.getItem("signature_client_id");

  // --- ÉTATS ---
  const [periode] = useState<"JOUR" | "SOIR">("JOUR"); 
  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [filter, setFilter] = useState<string>("Tous");
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [selectingAccId, setSelectingAccId] = useState<string | null>(null);
  const [addedSuppId, setAddedSuppId] = useState<string | null>(null);

  const isAnyDrawerOpen = selectingAccId !== null;

  // --- LOGIQUE DE REBOND (HINT) ---
  const triggerBounceHint = useCallback(() => {
    const scrollContainer = document.querySelector('.drawer-body-scroll');
    if (scrollContainer) {
      scrollContainer.classList.remove('hint-active');
      void (scrollContainer as HTMLElement).offsetWidth; 
      scrollContainer.classList.add('hint-active');
    }
  }, []);

  // Déclenchement à l'ouverture du tiroir
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
    return periode === "JOUR" 
      ? allPlats.filter(p => p.showInMenuJour) 
      : allPlats.filter(p => p.showInMenuSoir);
  }, [allPlats, periode]);

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

  const platsFiltres = useMemo(() => 
    platsDeLaPeriode.filter(p => {
      const matchUnivers = p.category?.univers === univers;
      if (!matchUnivers) return false;
      if (filter === "Tous") return true;
      return p.category?.name === filter;
    }), 
  [platsDeLaPeriode, univers, filter]);

  // --- ACTIONS ---
  const handleAddClick = (plat: Plat) => {
  if (isAnyDrawerOpen) {
    alert("Veuillez d'abord terminer votre personnalisation en cours.");
    return;
  }

  const result = addToCart(
    { 
      id: plat._id, 
      name: plat.name, 
      price: plat.price, 
      image: plat.image,
      type: periode, 
      supplements: [] 
    }, 
    periode
  );

  if (result === "LOCK_ERROR") {
    alert(`Votre panier contient déjà des produits d'un autre service.`);
    return;
  }

  // --- NOUVELLE LOGIQUE D'OUVERTURE ---
  const activeAccs = plat.accompaniments?.filter(a => a.active) || [];
  const canShowSupps = plat.allowSupplements === true;
  
  // On récupère le nombre d'articles de ce type APRES l'ajout
  const countInCart = cart.filter(i => i.id === plat._id).length + 1;
  const isOfferReached = plat.offer?.enabled && countInCart >= plat.offer.requiredQuantity;

  // Le tiroir s'ouvre si : Accompagnements OU Suppléments OU Offre activée
  if (activeAccs.length > 0 || canShowSupps || isOfferReached) {
    setSelectingAccId(plat._id);
    scrollToDrawer(plat._id);
  }
};

  const handleRemoveOne = (itemsInCart: any[]) => {
    if (itemsInCart.length > 0) {
      const lastItem = itemsInCart[itemsInCart.length - 1];
      removeFromCart(lastItem.cartItemId);
    }
  };

  if (isLoadingMenu) {
    return (
      <div className="menu-loading">
        <Loader2 className="animate-spin" size={40} color="#D4AF37" />
        <p>Signature prépare la carte...</p>
      </div>
    );
  }

  return (
    <section className="menu-section">
      {isAnyDrawerOpen && <div className="global-drawer-overlay" />}

      <div className="menu-header">
        <div className="header-content-wrapper">
          <div className="header-text-shield">
            <span className="menu-badge">L'Expérience Signature</span>
            <h2 className="menu-main-title">Notre Carte</h2>
            <div className="header-double-line"></div>
          </div>
        </div>
      </div>

      <div className="univers-selector-container">
        <div className="univers-selector">
          <button 
            className={`univers-btn ${univers === "Cuisine" ? "active" : ""} ${isAnyDrawerOpen ? "disabled" : ""}`} 
            onClick={() => !isAnyDrawerOpen && setUnivers("Cuisine")}
          >
            <Utensils size={18} /> La Table
          </button>
          <button 
            className={`univers-btn ${univers === "Boissons" ? "active" : ""} ${isAnyDrawerOpen ? "disabled" : ""}`} 
            onClick={() => !isAnyDrawerOpen && setUnivers("Boissons")}
          >
            <GlassWater size={18} /> La Cave
          </button>
        </div>
      </div>

      <div className="menu-filtres-container">
        <div className="menu-filtres-track">
          <div className="menu-filtres-list">
            {currentCategories.map((cat, idx) => (
              <button 
                key={idx} 
                className={`filter-btn ${filter === cat ? "active" : ""}`} 
                onClick={() => !isAnyDrawerOpen && setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="menu-grid">
        {platsFiltres.map(plat => {
          const itemsInCart = cart.filter(i => i.id === plat._id);
          const isFlipped = flippedId === plat._id;
          const isExpanding = selectingAccId === plat._id;
          const activeAccs = plat.accompaniments?.filter(a => a.active) || [];
          const lastItemAdded = itemsInCart[itemsInCart.length - 1];

          // 1. LOGIQUE DE TRACKING (ORIGINALE)
          const orderMatch = activeOrders.find((order: any) => 
            order.items.some((item: any) => item.productId === plat._id)
          );
          
          let currentStatus = null;
          if (orderMatch) {
            const status = orderMatch.status;
            const lastUpdate = new Date(orderMatch.updatedAt || orderMatch.createdAt).getTime();
            const now = Date.now();
            
            if (status === "archived") {
              currentStatus = null;
            } else if (status === "done" && (now - lastUpdate > 600000)) { 
              currentStatus = null;
            } else {
              currentStatus = status;
            }
          } 
          
          if (!currentStatus && itemsInCart.length > 0) {
            currentStatus = "in_cart"; 
          }

          return (
            <div key={plat._id} className={`menu-card-outer ${isExpanding ? "is-expanded" : ""}`}>
              <div className={`menu-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                
                <div className="card-face card-front">
                  <div className="menu-image-container">
  {/* Statut de commande (Cuisine, etc.) */}
  {currentStatus && <OrderStatusBadge status={currentStatus} />}

  {/* LE BADGE LUXE - ANGLE HAUT GAUCHE */}
  {plat.offer?.enabled && (
    <div className="luxury-offer-ribbon">
      <Sparkles size={10} className="ribbon-icon" />
      <span>Offre dès {plat.offer.requiredQuantity}</span>
    </div>
  )}

  {/* Image ou Placeholder */}
  {plat.image ? (
    <img src={plat.image} alt={plat.name} className="menu-img" />
  ) : (
    <div className="placeholder-img">S</div>
  )}

  {/* Prix unitaire */}
  <div className="price-badge-luxury">
    <span>{plat.price}€</span>
  </div>
</div>

                  <div className="menu-details-terracotta">
                    <h3>{plat.name}</h3>
                    <div className="title-underline-gold"></div>
                    <button className="view-details-btn" onClick={() => !isAnyDrawerOpen && setFlippedId(plat._id)}>
                      Détails du plat
                    </button>

                    <div className="card-actions">
                      {itemsInCart.length > 0 && !isExpanding && (
                        <button 
                          className="btn-remove-one" 
                          onClick={() => handleRemoveOne(itemsInCart)}
                        >
                          <MinusCircle size={20} color="#dbb022" />
                          <span className="btn-text-action">Retirer 1</span>
                        </button>
                      )}

                      <button 
                        className={`add-to-cart-btn ${isExpanding ? "btn-configuring" : ""}`} 
                        onClick={() => handleAddClick(plat)}
                      >
                        {isExpanding ? "Configuration..." : (
                          <>
                            <PlusCircle size={18} />
                            <span className="btn-text-action">
                              {itemsInCart.length > 0 ? `Ajouter (${itemsInCart.length})` : "Ajouter au panier"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div id={`drawer-${plat._id}`} className={`acc-selection-drawer ${isExpanding ? "open" : ""}`}>
                    <div className="drawer-header">
                      <div className="drawer-title"><Sparkles size={14} color="#d4af37" /> <span>Personnaliser</span></div>
                      <button 
                        className="btn-cancel-config" 
                        onClick={() => {
                          if (lastItemAdded) removeFromCart(lastItemAdded.cartItemId);
                          setSelectingAccId(null);
                        }}
                      >
                        <Trash2 size={16} /> Annuler
                      </button>
                    </div>

                   <div className="drawer-body-scroll">
  {/* --- SECTION OFFRE SPÉCIALE (AFFICHÉE SI QUOTA ATTEINT) --- */}
  {plat.offer?.enabled && itemsInCart.length >= plat.offer.requiredQuantity && (
    <div className="drawer-section offer-activation-zone">
      <div className="offer-congrats">
        <Sparkles size={18} className="ribbon-icon" />
        <span>Offre Signature Activée !</span>
      </div>
      <p className="offer-details">
        Vos <strong>{itemsInCart.length} {plat.name}</strong> passent à un tarif exceptionnel de <strong>{plat.offer.offerPrice}€</strong>.
      </p>
      <div className="savings-badge">
        Économie réalisée : {(plat.price * itemsInCart.length - plat.offer.offerPrice).toFixed(2)}€
      </div>
    </div>
  )}

  {/* --- SECTION ACCOMPAGNEMENTS --- */}
  {activeAccs.length > 0 && lastItemAdded && (
    <div className="drawer-section">
      <p className="drawer-label">Accompagnement :</p>
      <div className="acc-options-grid">
        {["Aucun", "Standard", ...activeAccs.map(a => a.name)].map(accName => (
          <button 
            key={accName}
            className={`acc-mini-choice ${lastItemAdded.chosenAccompaniment === accName ? "selected" : ""}`} 
            onClick={() => {
              updateLineAccompaniment(lastItemAdded.cartItemId, accName);
              triggerBounceHint();
            }}
          >
            {accName}
          </button>
        ))}
      </div>
    </div>
  )}

  {/* --- SECTION SUPPLEMENTS --- */}
  {plat.allowSupplements && lastItemAdded && (
    <div className="drawer-section">
      <p className="drawer-label">Extras</p>
      <div className="supps-list-container">
        {isLoadingSupps ? (
          <div className="drawer-loader-container">
            <Loader2 className="animate-spin" size={20} color="#D4AF37" />
          </div>
        ) : (
          supplementsDisponibles.map(supp => {
            const count = lastItemAdded.supplements?.filter(s => s.id === supp._id).length || 0;
            return (
              <div key={supp._id} className="supp-card-mini">
                <div className="supp-info">
                  <span className="supp-name">{supp.name}</span>
                  <span className="supp-price">+{supp.price}€</span>
                </div>
                <div className="supp-actions-wrapper">
                  {count > 0 && (
                    <button className="supp-mini-btn" onClick={() => {
                      removeSupplementFromLine(lastItemAdded.cartItemId, supp._id);
                      triggerBounceHint();
                    }}>
                      <MinusCircle size={20}/>
                    </button>
                  )}
                  {count > 0 && <span className="supp-count-badge">{count}</span>}
                  <button 
                    className="supp-mini-btn" 
                    onClick={() => {
                      addSupplementToLine(lastItemAdded.cartItemId, { id: supp._id, name: supp.name, price: supp.price });
                      setAddedSuppId(supp._id);
                      triggerBounceHint();
                      setTimeout(() => setAddedSuppId(null), 600);
                    }}
                  >
                    <PlusCircle size={20} className={addedSuppId === supp._id ? "added-anim" : ""}/>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )}

  {/* --- FOOTER DU TIROIR --- */}
  <div className="drawer-footer-action">
    <button className="btn-confirm-drawer" onClick={() => setSelectingAccId(null)}>
      <Check size={18} /> <span>Valider et continuer</span>
    </button>
  </div>
</div>
                  </div>
                </div>

                <div className="card-face card-back">
                  <button className="close-back-btn" onClick={() => setFlippedId(null)}><X size={20} /></button>
                  <div className="back-content">
                    <h4>{plat.name}</h4>
                    <div className="title-underline-gold"></div>
                    <p className="description-text">{plat.description || "Aucune description disponible."}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}