import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { 
  Loader2, X, Utensils, GlassWater, 
  Check, PlusCircle, Sparkles, MinusCircle,
  Clock, CreditCard, Gift, Flame,
  Star, Eye, Award, Search, ArrowRight,
  Heart, Zap, ChefHat, Tv, CalendarClock,
} from "lucide-react";
import "./menu.css";
import BillPopup from "../components/BillPopup";
import { useRestaurantHours } from "../hooks/useRestaurantHours";

// --- CONFIGURATION ---
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/menu?public=true`;
const SUPP_API = `${BASE_URL}/supplements?public=true`;

// --- BANNIÈRE SERVICE VERROUILLÉ ---
const ServiceLockedBanner = ({
  serviceLabel,
  nextInfo,
  onUnlock,
}: {
  serviceLabel: string;
  nextInfo: string | null;
  onUnlock: () => void;
}) => (
  <div className="service-locked-banner">
    <div className="locked-banner-content">
      <div className="locked-icon-wrap">
        <CalendarClock size={36} className="locked-icon" />
      </div>
      <div className="locked-text">
        <h3 className="locked-title">Service {serviceLabel} non disponible</h3>
        {nextInfo && (
          <p className="locked-subtitle">
            Le service en salle sera disponible à partir du{" "}
            <strong>{nextInfo}</strong>
          </p>
        )}
        <p className="locked-hint">
          Vous pouvez parcourir la carte et préparer votre commande. Vous avez également la possibilité de réserver une table, de commander à emporter pour récupérer aux heures de service. ou simplement de vous faire livrer.
        </p>
      </div>
      <button className="locked-cta-btn" onClick={onUnlock}>
        <span>Voir la carte &amp; Réserver</span>
        <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

// --- COMPOSANT VOYANT DE STATUT AVEC PROGRESSION ---
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string, color: string, icon: any, gradient: string, progress?: number }> = {
    in_cart: { 
      label: "À régler", 
      color: "#E74C3C",
      gradient: "linear-gradient(135deg, #E74C3C, #C0392B)",
      icon: <CreditCard size={12} />,
      progress: 0
    },
    pending: { 
      label: "En attente", 
      color: "#F39C12",
      gradient: "linear-gradient(135deg, #F39C12, #E67E22)",
      icon: <Clock size={12} />,
      progress: 25
    },
    cooking: { 
      label: "En cuisine", 
      color: "#E74C3C",
      gradient: "linear-gradient(135deg, #E74C3C, #C0392B)",
      icon: <Flame size={12} />,
      progress: 50
    },
    done: { 
      label: "Prêt", 
      color: "#27AE60",
      gradient: "linear-gradient(135deg, #27AE60, #1E8449)",
      icon: <Sparkles size={12} />,
      progress: 100
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="order-status-badge-premium" style={{ background: config.gradient }}>
      <div className="status-icon">{config.icon}</div>
      <span>{config.label}</span>
      {config.progress !== undefined && config.progress < 100 && (
        <div className="status-progress">
          <div className="status-progress-bar" style={{ width: `${config.progress}%` }} />
        </div>
      )}
    </div>
  );
};

// --- COMPOSANT OFFRE SPÉCIALE AMÉLIORÉ ---
const OfferBadge = ({ quantity, requiredQuantity }: { quantity: number; requiredQuantity: number }) => (
  <div className="offer-badge-enhanced">
    <Gift size={10} />
    <span>+{Math.floor(quantity / requiredQuantity)} offerte(s)</span>
  </div>
);

// --- COMPOSANT NOTE GASTRONOMIQUE AVEC ANIMATION ---
const GastronomicNote = ({ note, size = 10 }: { note: number; size?: number }) => (
  <div className="gastro-note-enhanced">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={size} 
        className={`gastro-star ${i < note ? "filled" : "empty"}`}
        fill={i < note ? "#D4AF37" : "none"}
      />
    ))}
    <span className="gastro-note-value">{note}.0</span>
  </div>
);

// --- COMPOSANT TIMER DE PRÉPARATION ---
const PreparationTimer = ({ minutes }: { minutes: number }) => (
  <div className="prep-timer-premium">
    <Clock size={12} />
    <span>{minutes} min</span>
  </div>
);

// --- FONCTION SCROLL AMÉLIORÉE ---
const scrollToDrawer = (id: string) => {
  setTimeout(() => {
    const element = document.getElementById(`drawer-${id}`);
    if (element) {
      const card = element.closest('.menu-card-enhanced');
      if (card) {
        const cardRect = card.getBoundingClientRect();
        const scrollTarget = window.scrollY + cardRect.top - 100;
        window.scrollTo({ top: scrollTarget + 120, behavior: 'smooth' });
      } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      element.classList.add('drawer-highlight');
      setTimeout(() => element.classList.remove('drawer-highlight'), 1000);
    }
  }, 150);
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
  // ─── HORAIRES ───────────────────────────────────────────────
  const { isJourOpen, nextJourInfo } = useRestaurantHours();
  const [unlocked, setUnlocked] = useState(false);

  // Le menu Jour est actif soit si c'est l'heure, soit si l'utilisateur a déverrouillé manuellement
  const isJourAvailable = isJourOpen || unlocked;
  // Une fois déverrouillé, les commandes sont autorisées (livraison, réservation, emporter)
  const canOrder = isJourOpen || unlocked;

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
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [hasPendingBill, setHasPendingBill] = useState(false);

  const isAnyDrawerOpen = selectingAccId !== null;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isAnyDrawerOpen && isMobile) {
        const drawer = document.querySelector('.customization-drawer-enhanced.open');
        const target = e.target as HTMLElement;
        if (drawer && !drawer.contains(target) && !target.closest('.add-btn')) {
          setSelectingAccId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAnyDrawerOpen, isMobile]);

  const triggerBounceHint = useCallback(() => {
    const drawerContent = document.querySelector('.customization-drawer-enhanced.open .drawer-content-enhanced');
    if (drawerContent) {
      drawerContent.classList.remove('hint-active');
      void (drawerContent as HTMLElement).offsetWidth; 
      drawerContent.classList.add('hint-active');
      setTimeout(() => drawerContent.classList.remove('hint-active'), 800);
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

  useEffect(() => {
    const now = Date.now();
    const justArchivedOrder = activeOrders.find((order: any) => {
      if (order.status !== "archived") return false;
      const archivedDate = new Date(order.updatedAt || order.createdAt).getTime();
      return (now - archivedDate) < 5000;
    });
    if (justArchivedOrder && cart.length > 0) {
      cart.forEach((item: any) => { removeFromCart(item.cartItemId); });
      showToast("✓ Commande terminée, merci !", "success");
    }
  }, [activeOrders]);

  // --- FILTRAGE ---
  const platsDeLaPeriode = useMemo(() => {
    if (!allPlats) return [];
    return period === "JOUR" 
      ? allPlats.filter(p => p.showInMenuJour) 
      : allPlats.filter(p => p.showInMenuSoir);
  }, [allPlats, period]);

  const supplementsDisponibles = useMemo(() => 
    (supplementsList?.filter(s => s.active) || []).sort((a, b) => a.name.localeCompare(b.name)), 
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

  const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
    const colors = { success: "#27ae60", error: "#e74c3c", info: "#3498db", warning: "#f39c12" };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:${colors[type]};color:white;padding:12px 24px;border-radius:10px;
      font-size:0.9rem;font-weight:600;z-index:10000;
      box-shadow:0 4px 20px rgba(0,0,0,0.25);
    `;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3500);
  };

  // --- ACTIONS ---
  const handleAddClick = (plat: Plat, currentQty: number) => {
    if (!canOrder) {
      showToast(
        nextJourInfo
          ? `🍽️ Les commandes ouvrent ${nextJourInfo}. Vous pouvez parcourir la carte !`
          : "🍽️ Service non disponible pour le moment.",
        "warning"
      );
      return;
    }
    if (hasPendingBill) {
      showToast("⚠️ Votre addition est en cours — réglez-la avant de commander à nouveau", "error");
      return;
    }
    if (isAnyDrawerOpen && selectingAccId !== plat._id) {
      setSelectingAccId(null);
      setTimeout(() => handleAddClick(plat, currentQty), 300);
      return;
    }

    const result = addToCart(
      { 
        id: plat._id, name: plat.name, price: plat.price, image: plat.image,
        type: period, supplements: [], offer: plat.offer 
      }, 
      period
    );

    if (result === "LOCK_ERROR") {
      showToast("Votre panier contient déjà des produits d'un autre service", "error");
      return;
    }

    const activeAccs = plat.accompaniments?.filter(a => a.active) || [];
    const hasSupps = plat.allowSupplements;
    const willHaveOffer = plat.offer?.enabled && (currentQty + 1) >= plat.offer.requiredQuantity;

    if (activeAccs.length > 0 || hasSupps || willHaveOffer) {
      setSelectingAccId(plat._id);
      scrollToDrawer(plat._id);
    } else {
      showToast(`✓ ${plat.name} ajouté au panier`, "success");
    }
  };

  const handleRemoveOne = (itemsInCart: any[], platName: string) => {
    if (itemsInCart.length > 0) {
      const lastItem = itemsInCart[itemsInCart.length - 1];
      removeFromCart(lastItem.cartItemId);
      showToast(`✓ ${platName} retiré du panier`, "info");
    }
  };

  const toggleLike = (platId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platId)) { newSet.delete(platId); showToast("Retiré de vos favoris", "info"); }
      else { newSet.add(platId); showToast("Ajouté à vos favoris", "success"); }
      return newSet;
    });
  };

  if (isLoadingMenu) {
    return (
      <div className="menu-loading-enhanced">
        <div className="loading-spiral">
          <div className="spiral-ring"></div>
          <div className="spiral-ring"></div>
          <div className="spiral-ring"></div>
          <div className="spiral-logo">S</div>
        </div>
        <p className="loading-text">Signature prépare sa carte gastronomique...</p>
        <div className="loading-progress-bar">
          <div className="loading-progress-fill"></div>
        </div>
      </div>
    );
  }

  // ─── SI LE SERVICE N'EST PAS DISPONIBLE ET PAS DÉVERROUILLÉ ─────────────────
  if (!isJourAvailable) {
    return (
      <section className="menu-section-enhanced">
        {/* HERO SECTION */}
        <div className="menu-hero-cinematic">
          <div className="hero-video-backdrop">
            <div className="hero-gradient-overlay"></div>
            <div className="hero-particles-container">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="hero-particle" style={{ 
                  '--delay': `${i * 0.3}s`, '--x': `${Math.random() * 100}%`,
                  '--duration': `${5 + Math.random() * 10}s`
                } as React.CSSProperties} />
              ))}
            </div>
          </div>
          <div className="hero-content-cinematic">
            <div className="hero-badge-cinematic"><Award size={16} /><span> ⭐⭐⭐</span></div>
            <h1 className="hero-title-cinematic">
              L'Art de la<span className="gold-gradient"> Table Signature</span>
            </h1>
            <div className="hero-separator-cinematic">
              <div className="separator-line gold"></div>
              <ChefHat size={28} className="separator-icon" />
              <div className="separator-line gold"></div>
            </div>
            <p className="hero-description-cinematic">
              Une symphonie de saveurs où chaque met raconte une histoire unique<br />
              Découvrez l'excellence gastronomique réinventée
            </p>
          </div>
        </div>

        {/* BANNIÈRE VERROUILLAGE */}
        <ServiceLockedBanner
          serviceLabel="Déjeuner"
          nextInfo={nextJourInfo}
          onUnlock={() => {
            setUnlocked(true);
            setTimeout(() => {
              document.querySelector('.menu-grid-enhanced')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />

        {/* ON AFFICHE QUAND MÊME LA CARTE EN MODE LECTURE SEULE */}
        <div className="controls-bar-enhanced visible">
          <div className="controls-container">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" placeholder="Rechercher un plat, une saveur..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-enhanced"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm("")}><X size={14} /></button>
              )}
            </div>
            <div className="univers-tabs">
              <button className={`univers-tab ${univers === "Cuisine" ? "active" : ""}`} onClick={() => setUnivers("Cuisine")}>
                <Utensils size={18} /><span>Cuisine</span>
              </button>
              <button className={`univers-tab ${univers === "Boissons" ? "active" : ""}`} onClick={() => setUnivers("Boissons")}>
                <GlassWater size={18} /><span>Boissons</span>
              </button>
            </div>
          </div>
        </div>
        <div className="categories-bar-enhanced">
          <div className="categories-scroll">
            {currentCategories.map((cat, idx) => (
              <button key={idx} className={`category-chip-enhanced ${filter === cat ? "active" : ""}`} onClick={() => setFilter(cat)}>
                <span className="chip-text">{cat}</span>
                {filter === cat && <div className="chip-active-indicator" />}
              </button>
            ))}
          </div>
        </div>
        
        {/* Carte en lecture seule (commandes désactivées) */}
        <div className="menu-grid-enhanced menu-readonly">
          {platsFiltres.map((plat, index) => (
            <div key={plat._id} className="menu-card-enhanced readonly" style={{ animationDelay: `${index * 0.03}s` }}>
              <div className="card-perspective">
                <div className="card-front-enhanced">
                  <div className="card-media">
                    <div className="media-wrapper">
                      {plat.image ? (
                        <img src={plat.image} alt={plat.name} className="card-image-enhanced" loading="lazy" />
                      ) : (
                        <div className="image-placeholder-enhanced"><Utensils size={32} /></div>
                      )}
                      <div className="media-overlay"></div>
                    </div>
                    <div className="price-chip">
                      <span className="price-symbol">€</span>
                      <span className="price-amount">{plat.price.toFixed(2)}</span>
                    </div>
                    <div className="card-badges">
                      {plat.spicy && <div className="badge spicy"><Flame size={10} /> Épicé</div>}
                      {plat.vegetarian && <div className="badge veg">🌱 Végétarien</div>}
                      {plat.glutenFree && <div className="badge gluten">🚫 Gluten Free</div>}
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="card-header">
                      <div className="category-tag">{plat.category?.name}</div>
                      {plat.gastronomicNote && <GastronomicNote note={plat.gastronomicNote} size={12} />}
                    </div>
                    <h3 className="plat-title">{plat.name}</h3>
                    <div className="title-underline"></div>
                    <p className="plat-description">
                      {plat.description.length > 90 ? `${plat.description.substring(0, 90)}...` : plat.description}
                    </p>
                    {plat.preparationTime && <PreparationTimer minutes={plat.preparationTime} />}
                    <div className="card-footer">
                      <button
                        className="add-btn readonly-order-btn"
                        onClick={() => showToast(
                          nextJourInfo ? `🍽️ Commandes disponibles ${nextJourInfo}` : "🍽️ Service non disponible",
                          "warning"
                        )}
                      >
                        <Clock size={16} />
                        <span>{nextJourInfo ? `Dispo ${nextJourInfo}` : "Bientôt disponible"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <BillPopup onBillPending={setHasPendingBill} />
      </section>
    );
  }

  // ─── AFFICHAGE NORMAL (service disponible ou déverrouillé) ──────────────────
  return (
    <section className="menu-section-enhanced">

      {/* BANNIÈRE SERVICE OUVERT */}
      {isJourOpen && (
        <div className="restaurant-open-banner">
          <Clock size={18} />
          <span>SERVICE DÉJEUNER EN COURS • Dernières commandes à 15h00</span>
        </div>
      )}

      {/* BANNIÈRE MODE PRÉVISUALISATION (déverrouillé manuellement) */}
      {!isJourOpen && unlocked && (
        <div className="restaurant-preview-banner">
          <Eye size={18} />
          <span>
            Mode aperçu — Les commandes seront disponibles{" "}
            {nextJourInfo ? nextJourInfo : "à l'ouverture du service"}
          </span>
        </div>
      )}

      {isAnyDrawerOpen && (
        <div 
          className={isMobile ? "drawer-overlay-mobile" : "drawer-overlay-premium"} 
          onClick={() => setSelectingAccId(null)} 
        />
      )}

      {/* HERO SECTION */}
      <div className="menu-hero-cinematic">
        <div className="hero-video-backdrop">
          <div className="hero-gradient-overlay"></div>
          <div className="hero-particles-container">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="hero-particle" style={{ 
                '--delay': `${i * 0.3}s`, '--x': `${Math.random() * 100}%`,
                '--duration': `${5 + Math.random() * 10}s`
              } as React.CSSProperties} />
            ))}
          </div>
        </div>
        <div className="hero-content-cinematic">
          <div className="hero-badge-cinematic"><Award size={16} /><span> ⭐⭐⭐</span></div>
          <h1 className="hero-title-cinematic">
            L'Art de la<span className="gold-gradient"> Table Signature</span>
          </h1>
          <div className="hero-separator-cinematic">
            <div className="separator-line gold"></div>
            <ChefHat size={28} className="separator-icon" />
            <div className="separator-line gold"></div>
          </div>
          <p className="hero-description-cinematic">
            Une symphonie de saveurs où chaque met raconte une histoire unique<br />
            Découvrez l'excellence gastronomique réinventée
          </p>
          <div className="hero-stats-cinematic">
            <div className="hero-stat"><span className="stat-number">15+</span><span className="stat-label">Plats Signature</span></div>
            <div className="hero-stat"><span className="stat-number">100%</span><span className="stat-label">Produits Frais</span></div>
            <div className="hero-stat"><span className="stat-number">⭐ 4.9</span><span className="stat-label">Notes Clients</span></div>
          </div>
          <div className="hero-cta-cinematic">
            <button className="cta-primary" onClick={() => {
              document.querySelector('.menu-grid-enhanced')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <span>Découvrir la carte</span><ArrowRight size={18} />
            </button>
            <button className="cta-secondary"><span>Réservation</span><Tv size={16} /></button>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
          <span>Scroll</span>
        </div>
      </div>

      {/* BARRE DE CONTRÔLE STICKY */}
      <div className={`controls-bar-enhanced ${scrollDirection === "up" ? "visible" : "hidden"}`}>
        <div className="controls-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" placeholder="Rechercher un plat, une saveur..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-enhanced"
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm("")}><X size={14} /></button>
            )}
          </div>
          <div className="univers-tabs">
            <button 
              className={`univers-tab ${univers === "Cuisine" ? "active" : ""} ${isAnyDrawerOpen ? "disabled" : ""}`} 
              onClick={() => !isAnyDrawerOpen && setUnivers("Cuisine")}
            >
              <Utensils size={18} /><span>Cuisine</span>
            </button>
            <button 
              className={`univers-tab ${univers === "Boissons" ? "active" : ""} ${isAnyDrawerOpen ? "disabled" : ""}`} 
              onClick={() => !isAnyDrawerOpen && setUnivers("Boissons")}
            >
              <GlassWater size={18} /><span>Boissons</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATÉGORIES */}
      <div className="categories-bar-enhanced">
        <div className="categories-scroll">
          {currentCategories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`category-chip-enhanced ${filter === cat ? "active" : ""}`} 
              onClick={() => setFilter(cat)}
            >
              <span className="chip-text">{cat}</span>
              {filter === cat && <div className="chip-active-indicator" />}
            </button>
          ))}
        </div>
      </div>

      {searchTerm && (
        <div className="search-results-enhanced">
          <div className="results-info"><Sparkles size={14} /><span>{platsFiltres.length} résultat(s)</span></div>
          <button className="clear-search" onClick={() => setSearchTerm("")}><X size={14} />Effacer</button>
        </div>
      )}

      {/* GRILLE DES PLATS */}
      <div className="menu-grid-enhanced">
        {platsFiltres.length > 0 ? (
          platsFiltres.map((plat, index) => {
            const quantityInCart = getItemQuantity(plat._id);
            const itemsInCart = cart.filter((i) => i.id === plat._id);
            const lastItemAdded = itemsInCart[itemsInCart.length - 1];
            const isFlipped = flippedId === plat._id;
            const isExpanding = selectingAccId === plat._id;
            const isHovered = hoveredCard === plat._id;
            const activeAccs = plat.accompaniments?.filter((a) => a.active) || [];
            const isLiked = likedItems.has(plat._id);

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
            if (!orderMatch && quantityInCart > 0) currentStatus = "in_cart";

            return (
              <div 
                key={plat._id} 
                className={`menu-card-enhanced ${isExpanding ? "expanded" : ""} ${isHovered ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCard(plat._id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className={`card-perspective ${isFlipped ? "flipped" : ""}`}>
                  
                  {/* FACE AVANT */}
                  <div className="card-front-enhanced">
                    <div className="card-media">
                      {currentStatus && <OrderStatusBadge status={currentStatus} />}
                      <div className="card-badges">
                        {plat.offer?.enabled && quantityInCart >= plat.offer.requiredQuantity && (
                          <OfferBadge quantity={quantityInCart} requiredQuantity={plat.offer.requiredQuantity} />
                        )}
                        {plat.spicy && <div className="badge spicy"><Flame size={10} /> Épicé</div>}
                        {plat.vegetarian && <div className="badge veg">🌱 Végétarien</div>}
                        {plat.glutenFree && <div className="badge gluten">🚫 Gluten Free</div>}
                      </div>
                      <div className="media-wrapper">
                        {plat.image ? (
                          <img src={plat.image} alt={plat.name} className="card-image-enhanced" loading="lazy" />
                        ) : (
                          <div className="image-placeholder-enhanced"><Utensils size={32} /></div>
                        )}
                        <div className="media-overlay"></div>
                      </div>
                      <div className="price-chip">
                        <span className="price-symbol">€</span>
                        <span className="price-amount">{plat.price.toFixed(2)}</span>
                      </div>
                      <div className="card-actions-floating">
                        <button 
                          className={`action-btn like-btn ${isLiked ? "active" : ""}`}
                          onClick={() => toggleLike(plat._id)}
                        >
                          <Heart size={16} fill={isLiked ? "#E74C3C" : "none"} />
                        </button>
                        <button 
                          className="action-btn view-btn"
                          onClick={() => setQuickViewId(quickViewId === plat._id ? null : plat._id)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="card-header">
                        <div className="category-tag">{plat.category?.name}</div>
                        {plat.gastronomicNote && <GastronomicNote note={plat.gastronomicNote} size={12} />}
                      </div>
                      <h3 className="plat-title">{plat.name}</h3>
                      <div className="title-underline"></div>
                      <p className="plat-description">
                        {plat.description.length > 90 ? `${plat.description.substring(0, 90)}...` : plat.description}
                      </p>
                      {plat.preparationTime && <PreparationTimer minutes={plat.preparationTime} />}
                      
                      <div className="card-footer">
                        <div className="quantity-controls">
                          {quantityInCart > 0 && !isExpanding && canOrder && (
                            <button className="qty-btn remove" onClick={() => handleRemoveOne(itemsInCart, plat.name)}>
                              <MinusCircle size={18} />
                            </button>
                          )}
                          {quantityInCart > 0 && <span className="qty-badge">{quantityInCart}</span>}
                          <button
                            className={`add-btn ${isExpanding ? "configuring" : ""} ${quantityInCart > 0 ? "has-items" : ""} ${!canOrder ? "preview-mode" : ""}`}
                            onClick={() => handleAddClick(plat, quantityInCart)}
                          >
                            {isExpanding ? (
                              <><Loader2 className="spin" size={16} /><span>Configuration...</span></>
                            ) : !canOrder ? (
                              <><Clock size={16} /><span>Aperçu</span></>
                            ) : (
                              <><PlusCircle size={18} /><span>{quantityInCart > 0 ? "Ajouter" : "Commander"}</span></>
                            )}
                          </button>
                        </div>
                        <button className="details-link" onClick={() => setFlippedId(plat._id)}>
                          <span>Détails</span><ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* TIROIR DE PERSONNALISATION */}
                    <div id={`drawer-${plat._id}`} className={`customization-drawer-enhanced ${isExpanding ? "open" : ""}`}>
                      <div className="drawer-handle-bar"></div>
                      <div className="drawer-header-enhanced">
                        <div className="drawer-title">
                          <Sparkles size={16} color="#D4AF37" />
                          <span>Personnalisez votre expérience</span>
                        </div>
                        <button className="drawer-close" onClick={() => setSelectingAccId(null)}><X size={18} /></button>
                      </div>

                      <div className="drawer-content-enhanced">
                        {plat.offer?.enabled && quantityInCart >= plat.offer.requiredQuantity && (() => {
                          const nbLots = Math.floor(quantityInCart / plat.offer.requiredQuantity);
                          const reste = quantityInCart % plat.offer.requiredQuantity;
                          const prixPromo = (nbLots * plat.offer.offerPrice) + (reste * plat.price);
                          const economie = (plat.price * quantityInCart) - prixPromo;
                          return (
                            <div className="offer-card">
                              <div className="offer-icon"><Gift size={20} /></div>
                              <div className="offer-info">
                                <div className="offer-title">Offre Signature Activée !</div>
                                <div className="offer-price">
                                  {quantityInCart} × {plat.name}
                                  <span className="offer-savings">Économie : {economie.toFixed(2)}€</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {activeAccs.length > 0 && lastItemAdded && (
                          <div className="drawer-section">
                            <label className="section-title"><Utensils size={14} />Accompagnement</label>
                            <div className="options-grid">
                              {["Aucun", "Standard", ...activeAccs.map(a => a.name)].map(accName => (
                                <button
                                  key={accName}
                                  className={`option ${lastItemAdded.chosenAccompaniment === accName ? "selected" : ""}`}
                                  onClick={() => { updateLineAccompaniment(lastItemAdded.cartItemId, accName); triggerBounceHint(); }}
                                >
                                  {accName}
                                  {lastItemAdded.chosenAccompaniment === accName && <Check size={12} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {plat.allowSupplements && lastItemAdded && (
                          <div className="drawer-section">
                            <label className="section-title"><PlusCircle size={14} />Extras & Suppléments</label>
                            <div className="supplements-list">
                              {isLoadingSupps ? (
                                <div className="supp-loader"><Loader2 className="spin" size={24} /></div>
                              ) : (
                                supplementsDisponibles.map(supp => {
                                  const count = lastItemAdded.supplements?.filter(s => s.id === supp._id).length || 0;
                                  return (
                                    <div key={supp._id} className="supplement-item">
                                      <div className="supp-info">
                                        <span className="supp-name">{supp.name}</span>
                                        <span className="supp-price">+{supp.price}€</span>
                                      </div>
                                      <div className="supp-quantity">
                                        {count > 0 && (
                                          <button className="supp-qty-btn" onClick={() => removeSupplementFromLine(lastItemAdded.cartItemId, supp._id)}>
                                            <MinusCircle size={16} />
                                          </button>
                                        )}
                                        {count > 0 && <span className="supp-count">{count}</span>}
                                        <button 
                                          className="supp-qty-btn add"
                                          onClick={() => {
                                            addSupplementToLine(lastItemAdded.cartItemId, { id: supp._id, name: supp.name, price: supp.price });
                                            setAddedSuppId(supp._id);
                                            triggerBounceHint();
                                            setTimeout(() => setAddedSuppId(null), 600);
                                          }}
                                        >
                                          <PlusCircle size={16} className={addedSuppId === supp._id ? "added-animation" : ""} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}

                        <button className="drawer-confirm" onClick={() => setSelectingAccId(null)}>
                          <Check size={18} /><span>Valider ma sélection</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FACE ARRIÈRE */}
                  <div className="card-back-enhanced">
                    <button className="back-close" onClick={() => setFlippedId(null)}><X size={18} /></button>
                    <div className="back-scroll">
                      <div className="back-image"><img src={plat.image} alt={plat.name} /></div>
                      <div className="back-details">
                        <div className="back-category">{plat.category?.name}</div>
                        <h2 className="back-title">{plat.name}</h2>
                        <div className="back-price-large">{plat.price.toFixed(2)}€</div>
                        <div className="back-info-grid">
                          {plat.gastronomicNote && (
                            <div className="info-item"><Star size={14} /><span>Note : {plat.gastronomicNote}/5</span></div>
                          )}
                          {plat.preparationTime && (
                            <div className="info-item"><Clock size={14} /><span>Préparation : {plat.preparationTime} min</span></div>
                          )}
                          {plat.calories && (
                            <div className="info-item"><Zap size={14} /><span>Calories : {plat.calories} kcal</span></div>
                          )}
                        </div>
                        <div className="back-divider"></div>
                        <p className="back-description-full">{plat.description}</p>
                        <div className="back-tags">
                          {plat.spicy && <span className="tag spicy">🌶️ Épicé</span>}
                          {plat.vegetarian && <span className="tag veg">🌱 Végétarien</span>}
                          {plat.vegan && <span className="tag vegan">🌿 Vegan</span>}
                          {plat.glutenFree && <span className="tag gluten">🚫 Sans gluten</span>}
                        </div>
                        <div className="back-actions">
                          <button 
                            className="order-now-btn" 
                            onClick={() => { setFlippedId(null); handleAddClick(plat, quantityInCart); }}
                          >
                            {canOrder ? "Commander maintenant" : `Disponible ${nextJourInfo || "bientôt"}`}
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
          <div className="empty-state-enhanced">
            <div className="empty-animation">
              <Utensils size={64} strokeWidth={1} />
              <div className="empty-sparkles">
                <Sparkles className="sparkle-1" size={24} />
                <Sparkles className="sparkle-2" size={16} />
              </div>
            </div>
            <h3>Aucun résultat trouvé</h3>
            <p>Nous n'avons pas trouvé de plat correspondant à votre recherche</p>
            <button className="reset-filters" onClick={() => { setFilter("Tous"); setSearchTerm(""); }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      <BillPopup onBillPending={setHasPendingBill} />
    </section>
  );
}