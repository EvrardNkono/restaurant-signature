import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCart, type CartItem, type CartSupplement } from "../context/CartContext"; 
import { 
  Loader2, X, Utensils, GlassWater, 
  Check, PlusCircle, Sparkles, MinusCircle, Trash2,
  Clock, CreditCard, Eye, ArrowRight, CalendarClock,
} from "lucide-react"; 
import "./menuSoir.css";
import BillPopup from "../components/BillPopup";
import { useRestaurantHours } from "../hooks/useRestaurantHours";

// --- CONFIGURATION ---
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/menu?public=true`;
const SUPP_API = `${BASE_URL}/supplements?public=true`;

// --- FONCTION POUR FORMATER LE MESSAGE D'OUVERTURE ---
const formatNextOpeningMessage = (nextInfo: string | null): string | null => {
  if (!nextInfo) return null;
  
  
  const lowerNextInfo = nextInfo.toLowerCase();
  
  // Si c'est "aujourd'hui" ou "ce soir"
  if (lowerNextInfo.includes("aujourd'hui") || lowerNextInfo.includes("ce soir")) {
    return `d'${nextInfo}`;
  }
  
  // Si le premier caractère est une voyelle
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  const firstChar = lowerNextInfo.charAt(0);
  
  if (vowels.includes(firstChar)) {
    return `d'${nextInfo}`;
  }
  
  return `de ${nextInfo}`;
};

// --- BANNIÈRE SERVICE VERROUILLÉ ---
const ServiceLockedBanner = ({
  serviceLabel,
  nextInfo,
  onUnlock,
}: {
  serviceLabel: string;
  nextInfo: string | null;
  onUnlock: () => void;
}) => {
  const formattedMessage = formatNextOpeningMessage(nextInfo);
  
  return (
    <div className="service-locked-banner-soir">
      <div className="locked-banner-content-soir">
        <div className="locked-icon-wrap-soir">
          <CalendarClock size={36} className="locked-icon-soir" />
        </div>
        <div className="locked-text-soir">
          <h3 className="locked-title-soir">Service {serviceLabel} non disponible</h3>
          {nextInfo && (
            <p className="locked-subtitle-soir">
              Le service en salle sera disponible à partir{" "}
              <strong>{formattedMessage}</strong>
            </p>
          )}
          <p className="locked-hint-soir">
            Vous pouvez parcourir la carte et préparer votre commande. Vous avez également la possibilité de réserver une table, de commander à emporter pour récupérer aux heures de service, ou simplement de vous faire livrer.
          </p>
        </div>
        <button className="locked-cta-btn-soir" onClick={onUnlock}>
          <span>Voir la carte &amp; Réserver</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
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

interface Supplement {
  _id: string;
  name: string;
  price: number;
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
  allowSupplements: boolean; 
  accompaniments: Accompaniment[]; 
  supplements: Supplement[];
  offer?: {
    enabled: boolean;
    requiredQuantity: number;
    offerPrice: number;
  };
}

// --- COMPOSANT VOYANT DE STATUT ---
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string, color: string, icon: any, pulse?: boolean }> = {
    in_cart: { label: "À régler", color: "#e74c3c", icon: <CreditCard size={12} />, pulse: true },
    pending: { label: "En attente", color: "#7f8c8d", icon: <Clock size={12} />, pulse: true },
    cooking: { label: "En cuisine", color: "#f39c12", icon: <Utensils size={12} />, pulse: true },
    done: { label: "Prêt", color: "#2ecc71", icon: <Sparkles size={12} /> },
  };
  const config = statusConfig[status] || { label: "Reçu", color: "#34495e", icon: <Check size={12} /> };
  return (
    <div className={`order-status-tag ${config.pulse ? "pulse-active" : ""}`} style={{ backgroundColor: config.color }}>
      {config.icon}<span>{config.label}</span>
    </div>
  );
};

const scrollToDrawer = (id: string) => {
  setTimeout(() => {
    const element = document.getElementById(`drawer-${id}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

export default function MenuSoir() {
  // ─── HORAIRES ───────────────────────────────────────────────
  const { isSoirOpen, nextSoirInfo } = useRestaurantHours();
  const [unlocked, setUnlocked] = useState(false);

  // Le menu Soir est visible soit si c'est l'heure, soit si l'utilisateur a déverrouillé
  const isSoirAvailable = isSoirOpen || unlocked;

  const { 
    cart, addToCart, removeFromCart, getItemQuantity,
    addSupplementToLine, removeSupplementFromLine, updateLineAccompaniment,
  } = useCart();

  const clientId = localStorage.getItem("signature_client_id");

  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [filter, setFilter] = useState<string>("Tous");
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [addedSuppId, setAddedSuppId] = useState<string | null>(null);
  const [tempItem, setTempItem] = useState<CartItem | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [hasPendingBill, setHasPendingBill] = useState(false);

  const isAnyDrawerOpen = tempItem !== null || editingCartItemId !== null;
  const openDrawerPlatId = tempItem?.id ?? 
    (editingCartItemId ? cart.find(i => i.cartItemId === editingCartItemId)?.id ?? null : null);

  // --- DATA FETCHERS ---
  const { data: allPlats, isLoading: isLoadingMenu } = useQuery<Plat[]>({
    queryKey: ['full-catalog'],
    queryFn: async () => { const r = await axios.get(API_URL); return r.data.data; },
    staleTime: 1000 * 60 * 5, 
  });

  const { data: supplementsList, isLoading: isLoadingSupps } = useQuery<Supplement[]>({
    queryKey: ['menu-supplements'],
    queryFn: async () => { const r = await axios.get(SUPP_API); return r.data.data; },
    staleTime: 1000 * 60 * 30,
  });

  const { data: activeOrders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["active-orders", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const r = await axios.get(`${BASE_URL}/orders/track/${clientId}`);
      return r.data.orders || [];
    },
    refetchInterval: 10000,
    enabled: !!clientId
  });

  useEffect(() => { if (clientId) refetchOrders(); }, [clientId, cart.length, refetchOrders]);

  const seenArchivedIds = useState<Set<string>>(() => new Set())[0];
  useEffect(() => {
    if (!activeOrders.length) return;
    const newlyArchived = activeOrders.find((order: any) => {
      if (order.status !== "archived") return false;
      return !seenArchivedIds.has(order._id);
    });
    if (newlyArchived) {
      seenArchivedIds.add(newlyArchived._id);
      if (cart.length > 0) {
        cart.forEach((item: any) => removeFromCart(item.cartItemId));
        showToast("✓ Commande terminée, merci !", "success");
      }
    }
  }, [activeOrders]);

  // --- FILTRAGE ---
  const platsDuSoir = useMemo(() => allPlats?.filter(p => p.showInMenuSoir === true) || [], [allPlats]);

  const currentCategories = useMemo(() => [
    "Tous",
    ...new Set(
      platsDuSoir.filter(p => p.category?.univers === univers).map(p => p.category?.name).filter(Boolean)
    )
  ], [platsDuSoir, univers]);

  const platsFiltres = useMemo(() => 
    platsDuSoir.filter(p => {
      if (p.category?.univers !== univers) return false;
      if (filter === "Tous") return true;
      return p.category?.name === filter;
    }), 
  [platsDuSoir, univers, filter]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "error") => {
    const colors = { success: "#27ae60", error: "#e74c3c", warning: "#f39c12", info: "#3498db" };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:${colors[type]};color:#fff;padding:12px 24px;border-radius:10px;
      font-size:0.9rem;font-weight:600;z-index:10000;
      box-shadow:0 4px 20px rgba(0,0,0,0.25);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  // --- ACTIONS ---
  const handleRemoveOne = (platId: string) => {
    const itemsInCart = cart.filter(i => i.id === platId);
    if (itemsInCart.length > 0) removeFromCart(itemsInCart[itemsInCart.length - 1].cartItemId);
  };

  // Vérification stricte avec isSoirOpen
  const handleAddClick = (plat: Plat) => {
    if (!isSoirOpen) {
      const formattedMsg = formatNextOpeningMessage(nextSoirInfo);
      showToast(
        nextSoirInfo
          ? `🍽️ Les commandes ouvrent à partir ${formattedMsg}. Vous pouvez parcourir la carte !`
          : "🍽️ Service non disponible pour le moment.",
        "warning"
      );
      return;
    }
    if (hasPendingBill) {
      showToast("⚠️ Votre addition est en cours — réglez-la avant de commander à nouveau.", "error");
      return;
    }
    if (isAnyDrawerOpen) {
      showToast("Veuillez d'abord terminer la configuration en cours.", "warning");
      return;
    }

    const activeAccs = plat.accompaniments?.filter(a => a.active) || [];
    const canHaveSupps = plat.allowSupplements || (plat.supplements && plat.supplements.length > 0);
    const countInCart = getItemQuantity(plat._id); 
    const willReachOffer = plat.offer?.enabled && (countInCart + 1) >= plat.offer.requiredQuantity;

    const newItem: CartItem = {
      cartItemId: `${plat._id}-${Date.now()}`,
      id: plat._id, name: plat.name, price: plat.price, quantity: 1,
      image: plat.image,
      chosenAccompaniment: (activeAccs.length > 0) ? "Standard" : "Aucun",
      supplements: [], status: "pending", type: "SOIR", offer: plat.offer 
    };

    if (activeAccs.length > 0 || canHaveSupps || willReachOffer) {
      setTempItem(newItem);
      setEditingCartItemId(null);
      scrollToDrawer(plat._id);
    } else {
      const result = addToCart(newItem, "SOIR");
      if (result === "LOCK_ERROR") {
        showToast("Votre panier contient déjà des produits d'un autre service (MIDI).", "error");
      } else {
        showToast(`✓ ${plat.name} ajouté au panier`, "success");
      }
    }
  };

  // Vérification stricte pour l'édition
  const handleEditExistingItem = (plat: Plat) => {
    if (!isSoirOpen) {
      showToast("Impossible de modifier : service fermé", "error"); 
      return;
    }
    if (isAnyDrawerOpen) return;
    const itemsInCart = cart.filter(i => i.id === plat._id);
    if (itemsInCart.length === 0) return;
    setEditingCartItemId(itemsInCart[itemsInCart.length - 1].cartItemId);
    setTempItem(null);
    scrollToDrawer(plat._id);
  };

  const handleUpdateTempAcc = (accName: string) => {
    if (!tempItem) return;
    setTempItem({ ...tempItem, chosenAccompaniment: accName });
  };

  const handleAddTempSupp = (supp: { id: string, name: string, price: number }) => {
    if (!tempItem) return;
    const newSupp: CartSupplement = { id: supp.id, name: supp.name, price: supp.price, status: "pending" };
    setTempItem({ ...tempItem, supplements: [...(tempItem.supplements || []), newSupp] });
    setAddedSuppId(supp.id);
    setTimeout(() => setAddedSuppId(null), 800);
  };

  const handleRemoveTempSupp = (suppId: string) => {
    if (!tempItem?.supplements) return;
    const supps = [...tempItem.supplements];
    for (let i = supps.length - 1; i >= 0; i--) {
      if (supps[i].id === suppId) { supps.splice(i, 1); break; }
    }
    setTempItem({ ...tempItem, supplements: supps });
  };

  const handleConfirmAddition = () => {
    if (!tempItem) return;
    const result = addToCart(tempItem, "SOIR");
    if (result === "LOCK_ERROR") {
      showToast("Votre panier contient déjà des produits d'un autre service (MIDI).", "error");
    } else {
      showToast(`✓ ${tempItem.name} ajouté au panier`, "success");
      setTempItem(null);
    }
  };

  const handleCloseDrawer = () => { setTempItem(null); setEditingCartItemId(null); };

  const handleUniversChange = (newUnivers: "Cuisine" | "Boissons") => {
    if (isAnyDrawerOpen) return;
    setUnivers(newUnivers);
    setFilter("Tous");
  };

  useEffect(() => {
    if (tempItem || editingCartItemId) {
      const scrollContainer = document.querySelector('.drawer-body-scroll');
      if (scrollContainer) {
        const timer = setTimeout(() => {
          scrollContainer.classList.add('hint-active');
          setTimeout(() => scrollContainer.classList.remove('hint-active'), 2000);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [tempItem, editingCartItemId]);

  // Formatage du message pour les boutons "Dispo"
  const getButtonAvailabilityText = (): string => {
    if (!nextSoirInfo) return "Bientôt disponible";
    const formattedMsg = formatNextOpeningMessage(nextSoirInfo);
    return `Dispo à partir ${formattedMsg}`;
  };

  if (isLoadingMenu) {
    return (
      <div className="menu-soir-loading">
        <Loader2 className="animate-spin" size={40} color="#d4af37" />
        <p>Mise en place de l'expérience nocturne...</p>
      </div>
    );
  }

  // ─── SI SERVICE INDISPONIBLE ET PAS DÉVERROUILLÉ ─────────────────────────
  if (!isSoirAvailable) {
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

        {/* BANNIÈRE VERROUILLAGE */}
        <ServiceLockedBanner
          serviceLabel="Dîner"
          nextInfo={nextSoirInfo}
          onUnlock={() => {
            setUnlocked(true);
            setTimeout(() => {
              document.querySelector('.menu-grid')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />

        {/* CARTE EN LECTURE SEULE */}
        <div className="univers-selector-container-soir">
          <div className="univers-selector-soir">
            <button className={`univers-btn-soir ${univers === "Cuisine" ? "active" : ""}`} onClick={() => handleUniversChange("Cuisine")}>
              <Utensils size={18} /> La Table
            </button>
            <button className={`univers-btn-soir ${univers === "Boissons" ? "active" : ""}`} onClick={() => handleUniversChange("Boissons")}>
              <GlassWater size={18} /> La Cave
            </button>
          </div>
        </div>
        <div className="menu-filtres-soir-container">
          <div className="menu-filtres-track-soir">
            <div className="menu-filtres-list-soir">
              {currentCategories.map((cat, idx) => (
                <button key={idx} className={`filter-btn-soir ${filter === cat ? "active" : ""}`} onClick={() => setFilter(cat as string)}>
                  {cat as string}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="menu-grid">
          {platsFiltres.map(plat => (
            <div key={plat._id} className="menu-card-outer soir-variant readonly-card">
              <div className="menu-card-inner">
                <div className="card-face-soir card-front-soir">
                  <div className="menu-image-container">
                    {plat.offer?.enabled && (
                      <div className="luxury-offer-ribbon">
                        <Sparkles size={10} className="ribbon-icon" />
                        <span>Offre dès {plat.offer.requiredQuantity}</span>
                      </div>
                    )}
                    {plat.image ? <img src={plat.image} alt={plat.name} className="menu-img" /> : <div className="placeholder-soir">Signature</div>}
                    <div className="price-tag-evening"><span>{plat.price.toFixed(2)}€</span></div>
                  </div>
                  <div className="details-container-soir">
                    <h3>{plat.name}</h3>
                    <div className="gold-separator"></div>
                    <p className="description-preview-soir">{plat.description}</p>
                    <div className="card-actions" style={{ marginTop: '15px' }}>
                      <button
                        className="btn-add-soir"
                        style={{ width: '100%', opacity: 0.7, cursor: 'default' }}
                        onClick={() => showToast(
                          nextSoirInfo ? `🍽️ Commandes disponibles à partir ${formatNextOpeningMessage(nextSoirInfo)}` : "🍽️ Service non disponible",
                          "warning"
                        )}
                      >
                        <Clock size={16} style={{ marginRight: '8px' }} />
                        {getButtonAvailabilityText()}
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

  // ─── AFFICHAGE NORMAL ────────────────────────────────────────────────────────
  return (
    <section className="menu-soir-section">

      {/* BANNIÈRE SERVICE OUVERT */}
      {isSoirOpen && (
        <div className="restaurant-open-banner">
          <Clock size={18} />
          <span>SERVICE SOIR EN COURS • Dernières commandes à 23h00</span>
        </div>
      )}

      {/* BANNIÈRE MODE APERÇU */}
      {!isSoirOpen && unlocked && (
        <div className="restaurant-preview-banner-soir">
          <Eye size={18} />
          <span>
            Mode aperçu — Les commandes seront disponibles à partir{" "}
            {nextSoirInfo ? formatNextOpeningMessage(nextSoirInfo) : "de l'ouverture du service"}
          </span>
        </div>
      )}

      {isAnyDrawerOpen && <div className="global-drawer-overlay" onClick={handleCloseDrawer} />}

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
          <button 
            className={`univers-btn-soir ${univers === "Cuisine" ? "active" : ""} ${isAnyDrawerOpen ? "disabled-btn" : ""}`} 
            onClick={() => handleUniversChange("Cuisine")}
          >
            <Utensils size={18} /> La Table
          </button>
          <button 
            className={`univers-btn-soir ${univers === "Boissons" ? "active" : ""} ${isAnyDrawerOpen ? "disabled-btn" : ""}`} 
            onClick={() => handleUniversChange("Boissons")}
          >
            <GlassWater size={18} /> La Cave
          </button>
        </div>
      </div>

      <div className="menu-filtres-soir-container">
        <div className="menu-filtres-track-soir">
          <div className="menu-filtres-list-soir">
            {currentCategories.map((cat, idx) => (
              <button 
                key={idx} 
                className={`filter-btn-soir ${filter === cat ? "active" : ""} ${isAnyDrawerOpen ? "disabled-btn" : ""}`} 
                onClick={() => !isAnyDrawerOpen && setFilter(cat as string)}
              >
                {cat as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="menu-grid">
        {platsFiltres.map(plat => {
          const itemsInCart = cart.filter((i: CartItem) => i.id === plat._id);
          const isFlipped = flippedId === plat._id;
          const isExpanding = openDrawerPlatId === plat._id;
          const quantityInCart = getItemQuantity(plat._id);
          
          const orderMatch = activeOrders.find((order: any) => 
            order.items.some((item: any) => item.productId === plat._id)
          );
          let currentStatus = null;
          if (orderMatch) {
            const status = orderMatch.status;
            const lastUpdate = new Date(orderMatch.updatedAt || orderMatch.createdAt).getTime();
            const now = Date.now();
            if (status === "archived") { currentStatus = null; }
            else if (status === "done" && (now - lastUpdate > 10 * 60 * 1000)) { currentStatus = null; }
            else { currentStatus = status; }
          } 
          if (!currentStatus && itemsInCart.length > 0) currentStatus = "in_cart";

          const suppsToShow = plat.allowSupplements 
            ? (supplementsList?.filter(s => s.active) || []) 
            : (plat.supplements?.filter(s => s.active) || []);

          const editingItem = editingCartItemId ? cart.find(i => i.cartItemId === editingCartItemId) ?? null : null;
          const drawerItem = tempItem?.id === plat._id ? tempItem : editingItem;

          return (
            <div key={plat._id} className={`menu-card-outer soir-variant ${isExpanding ? "is-expanded" : ""}`}>
              <div className={`menu-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                
                <div className="card-face-soir card-front-soir">
                  <div className="menu-image-container">
                    {currentStatus && <OrderStatusBadge status={currentStatus} />}
                    {plat.offer?.enabled && (
                      <div className="luxury-offer-ribbon">
                        <Sparkles size={10} className="ribbon-icon" />
                        <span>Offre dès {plat.offer.requiredQuantity}</span>
                      </div>
                    )}
                    {plat.image ? <img src={plat.image} alt={plat.name} className="menu-img" /> : <div className="placeholder-soir">Signature</div>}
                    <div className="price-tag-evening"><span>{plat.price.toFixed(2)}€</span></div>
                  </div>

                  <div className="details-container-soir">
                    <h3>{plat.name}</h3>
                    <div className="gold-separator"></div>
                    <p className="description-preview-soir">{plat.description}</p>
                    <button 
                      className="view-details-btn-soir" 
                      onClick={() => !isAnyDrawerOpen && setFlippedId(plat._id)}
                    >
                      Voir plus...
                    </button>

                    <div className="card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                      <button 
                        className={`btn-add-soir ${(isAnyDrawerOpen && !isExpanding) || !isSoirOpen ? "btn-disabled" : ""} ${isExpanding ? "btn-configuring" : ""}`} 
                        onClick={() => handleAddClick(plat)}
                        style={{ width: '100%' }}
                      >
                        {isExpanding && tempItem?.id === plat._id ? "Configuration..." : (
                          <>
                            {isSoirOpen ? <PlusCircle size={18} style={{ marginRight: '8px' }} /> : <Clock size={18} style={{ marginRight: '8px' }} />}
                            {isSoirOpen
                              ? (quantityInCart > 0 ? `Ajouter (${quantityInCart})` : "Ajouter au panier")
                              : (nextSoirInfo ? getButtonAvailabilityText() : "Aperçu")}
                          </>
                        )}
                      </button>

                      {quantityInCart > 0 && !isExpanding && isSoirOpen && (
                        <button 
                          className="btn-edit-soir"
                          onClick={() => handleEditExistingItem(plat)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px', padding: '10px',
                            fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase',
                            background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)',
                            borderRadius: '8px', color: '#D4AF37', cursor: 'pointer',
                          }}
                        >
                          <Sparkles size={14} /><span>Modifier ma commande</span>
                        </button>
                      )}

                      {quantityInCart > 0 && !isExpanding && isSoirOpen && (
                        <button 
                          className="btn-remove-quick-soir"
                          onClick={() => handleRemoveOne(plat._id)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px', padding: '10px',
                            fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase'
                          }}
                        >
                          <MinusCircle size={18} /><span>Retirer un article</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TIROIR DE PERSONNALISATION */}
                  <div id={`drawer-${plat._id}`} className={`acc-selection-drawer ${isExpanding ? "open" : ""}`}>
                    <div className="drawer-header">
                      <div className="drawer-title">
                        <Sparkles size={14} color="#d4af37" />
                        <span>{editingCartItemId && editingItem?.id === plat._id ? "Modifier votre commande" : "Personnalisation"}</span>
                      </div>
                      <button className="btn-cancel-config" onClick={handleCloseDrawer}>
                        <Trash2 size={16} /> <span>{editingCartItemId ? "Fermer" : "Annuler"}</span>
                      </button>
                    </div>

                    <div className="drawer-body-scroll">
                      {/* Offre */}
                      {tempItem?.id === plat._id && plat.offer?.enabled && (quantityInCart + 1) >= plat.offer.requiredQuantity && (() => {
                        const totalQtyAfterAdding = quantityInCart + 1;
                        const nbLots = Math.floor(totalQtyAfterAdding / plat.offer.requiredQuantity);
                        const reste = totalQtyAfterAdding % plat.offer.requiredQuantity;
                        const prixTotal = (nbLots * plat.offer.offerPrice) + (reste * plat.price);
                        const prixNormal = totalQtyAfterAdding * plat.price;
                        const economie = prixNormal - prixTotal;
                        return (
                          <div className="drawer-section offer-activation-zone">
                            <div className="offer-congrats"><Sparkles size={18} className="ribbon-icon" /><span>Offre Signature Activée !</span></div>
                            <p className="offer-details">Vos <strong>{totalQtyAfterAdding} {plat.name}</strong> passent à <strong>{prixTotal.toFixed(2)}€</strong></p>
                            {economie > 0 && (
                              <p className="offer-subtext" style={{ color: '#4ade80', fontWeight: 'bold', marginTop: '5px' }}>
                                Vous économisez immédiatement {economie.toFixed(2)}€
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Accompagnements */}
                      {(plat.accompaniments?.filter(a => a.active).length || 0) > 0 && drawerItem && (
                        <div className="drawer-section">
                          <p className="drawer-label">Accompagnement (Gratuit)</p>
                          <div className="acc-options-grid">
                            {["Aucun", "Standard", ...plat.accompaniments.filter(a => a.active).map(a => a.name)].map(accName => (
                              <button
                                key={accName}
                                className={`acc-mini-choice ${drawerItem.chosenAccompaniment === accName ? "selected" : ""}`}
                                onClick={() => {
                                  if (tempItem?.id === plat._id) handleUpdateTempAcc(accName);
                                  else if (editingCartItemId) updateLineAccompaniment(editingCartItemId, accName);
                                }}
                              >
                                {accName}
                                {drawerItem.chosenAccompaniment === accName && <Check size={12} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suppléments */}
                      {suppsToShow.length > 0 && drawerItem && (
                        <div className="drawer-section">
                          <p className="drawer-label">Extras (Payant)</p>
                          <div className="supps-list-container">
                            {isLoadingSupps ? <Loader2 className="animate-spin" /> : suppsToShow.map(supp => {
                              const count = drawerItem.supplements?.filter(s => s.id === supp._id).length || 0;
                              return (
                                <div key={supp._id} className="supp-card-mini">
                                  <div className="supp-mini-info">
                                    <span className="supp-mini-name">{supp.name}</span>
                                    <span className="supp-mini-price">+{supp.price.toFixed(2)}€</span>
                                  </div>
                                  <div className="supp-actions-wrapper">
                                    {count > 0 && (
                                      <button className="supp-mini-remove" onClick={() => {
                                        if (tempItem?.id === plat._id) handleRemoveTempSupp(supp._id);
                                        else if (editingCartItemId) removeSupplementFromLine(editingCartItemId, supp._id);
                                      }}>
                                        <MinusCircle size={20} />
                                      </button>
                                    )}
                                    {count > 0 && <span className="supp-count-badge">{count}</span>}
                                    <button 
                                      className={`supp-mini-add ${addedSuppId === supp._id ? "success" : ""}`} 
                                      onClick={() => {
                                        if (tempItem?.id === plat._id) {
                                          handleAddTempSupp({ id: supp._id, name: supp.name, price: supp.price });
                                        } else if (editingCartItemId) {
                                          addSupplementToLine(editingCartItemId, { id: supp._id, name: supp.name, price: supp.price });
                                          setAddedSuppId(supp._id);
                                          setTimeout(() => setAddedSuppId(null), 800);
                                        }
                                      }}
                                    >
                                      {addedSuppId === supp._id ? <Check size={20} /> : <PlusCircle size={20} />}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {tempItem?.id === plat._id && (
                        <button type="button" className="btn-confirm-drawer" onClick={handleConfirmAddition}>
                          <Check size={20} /> Terminer et ajouter
                        </button>
                      )}
                      {editingCartItemId && editingItem?.id === plat._id && (
                        <button type="button" className="btn-confirm-drawer" onClick={handleCloseDrawer}>
                          <Check size={20} /> Valider les modifications
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* FACE ARRIÈRE */}
                <div className="card-face-soir card-back-soir">
                  <button className="close-back-btn-soir" onClick={() => setFlippedId(null)}><X size={20} /></button>
                  <div className="back-content-soir">
                    <div className="back-header-soir">
                      <div className="back-circle-img-soir">
                        {plat.image ? <img src={plat.image} alt={plat.name} /> : <div className="circle-placeholder-soir">S</div>}
                      </div>
                      <div className="back-title-group">
                        <h4>{plat.name}</h4>
                        <span className="back-price-soir">{plat.price.toFixed(2)}€</span>
                      </div>
                    </div>
                    <div className="gold-separator-small"></div>
                    <div className="back-body-soir"><p className="full-description-soir">{plat.description}</p></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BillPopup onBillPending={setHasPendingBill} />
    </section>
  );
}