import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCart, type CartItem, type CartSupplement } from "../context/CartContext"; 
import { 
  Loader2, X, Utensils, GlassWater, 
  Check, PlusCircle, Sparkles, MinusCircle, Trash2,
  Clock, CreditCard
} from "lucide-react"; 
import "./menuSoir.css";

// --- CONFIGURATION DES ENDPOINTS ---
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/menu?public=true`;
const SUPP_API = `${BASE_URL}/supplements?public=true`;


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
  // Ajout de la structure d'offre conformément au menu jour
  offer?: {
    enabled: boolean;
    requiredQuantity: number;
    offerPrice: number;
  };
}

// --- COMPOSANT VOYANT DE STATUT ---
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string, color: string, icon: any, pulse?: boolean }> = {
    in_cart: { 
      label: "À régler", 
      color: "#e74c3c", 
      icon: <CreditCard size={12} />,
      pulse: true 
    },
    pending: { 
      label: "En attente", 
      color: "#7f8c8d", 
      icon: <Clock size={12} />,
      pulse: true
    },
    cooking: { 
      label: "En cuisine", 
      color: "#f39c12", 
      icon: <Utensils size={12} />, 
      pulse: true 
    },
    done: { 
      label: "Prêt", 
      color: "#2ecc71", 
      icon: <Sparkles size={12} /> 
    },
  };

  const config = statusConfig[status] || { label: "Reçu", color: "#34495e", icon: <Check size={12} /> };

  return (
    <div className={`order-status-tag ${config.pulse ? "pulse-active" : ""}`} 
         style={{ backgroundColor: config.color }}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

// --- UTILITAIRE SCROLL ---
const scrollToDrawer = (id: string) => {
  setTimeout(() => {
    const element = document.getElementById(`drawer-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};

export default function MenuSoir() {
  const { cart, addToCart, removeFromCart, getItemQuantity } = useCart();
  const clientId = localStorage.getItem("signature_client_id");

  // --- ÉTATS ---
  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [filter, setFilter] = useState<string>("Tous");
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [addedSuppId, setAddedSuppId] = useState<string | null>(null);
  const [tempItem, setTempItem] = useState<CartItem | null>(null);

  const isAnyDrawerOpen = tempItem !== null;

  // --- DATA FETCHERS ---
  const { data: allPlats, isLoading: isLoadingMenu } = useQuery<Plat[]>({
    queryKey: ['full-catalog'],
    queryFn: async () => {
      const response = await axios.get(API_URL);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  const { data: supplementsList, isLoading: isLoadingSupps } = useQuery<Supplement[]>({
    queryKey: ['menu-supplements'],
    queryFn: async () => {
      const response = await axios.get(SUPP_API);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  // RÉCUPÉRATION DES COMMANDES RÉELLES (Tracking)
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

  // --- SYNCHRONISATION DES STATUTS ---
  useEffect(() => {
    if (clientId) {
      refetchOrders();
    }
  }, [clientId, cart.length, refetchOrders]);

  // --- FILTRAGE ---
  const platsDuSoir = useMemo(() => 
    allPlats?.filter((p) => p.showInMenuSoir === true) || [], 
  [allPlats]);

  const currentCategories = useMemo(() => [
    "Tous",
    ...new Set(
      platsDuSoir
        .filter(p => p.category?.univers === univers)
        .map(p => p.category?.name)
        .filter(Boolean)
    )
  ], [platsDuSoir, univers]);

  const platsFiltres = useMemo(() => 
    platsDuSoir.filter(p => {
      const matchUnivers = p.category?.univers === univers;
      if (!matchUnivers) return false;
      if (filter === "Tous") return true;
      return p.category?.name === filter;
    }), 
  [platsDuSoir, univers, filter]);

  // --- ACTIONS ---

  const handleRemoveOne = (platId: string) => {
  const itemsInCart = cart.filter((i) => i.id === platId);
  if (itemsInCart.length > 0) {
    // On retire le dernier ajouté (LIFO) pour respecter la logique de personnalisation
    const lastItem = itemsInCart[itemsInCart.length - 1];
    removeFromCart(lastItem.cartItemId);
  }
};

const handleAddClick = (plat: Plat) => {
  if (isAnyDrawerOpen) {
    alert(`Veuillez d'abord terminer la configuration de votre ${tempItem?.name}.`);
    return;
  }

  // 1. On récupère les infos
  const activeAccs = plat.accompaniments?.filter(a => a.active) || [];
  const canHaveSupps = plat.allowSupplements || (plat.supplements && plat.supplements.length > 0);
  
  // 2. On calcule si le quota est atteint AVEC ce clic (+1)
  const countInCart = getItemQuantity(plat._id); 
  const willReachOffer = plat.offer?.enabled && (countInCart + 1) >= plat.offer.requiredQuantity;

  // 3. Création de l'objet temporaire
  const newItem: CartItem = {
    cartItemId: `${plat._id}-${Date.now()}`,
    id: plat._id,
    name: plat.name,
    price: plat.price,
    quantity: 1, 
    image: plat.image,
    chosenAccompaniment: (activeAccs.length > 0) ? "Standard" : "Aucun",
    supplements: [],
    status: "pending",
    type: "SOIR",
    offer: plat.offer 
  };

  // 4. LA CONDITION CLÉ : 
  // On ouvre si : il y a des accs OU des suppléments OU si on atteint le quota de l'offre
  if (activeAccs.length > 0 || canHaveSupps || willReachOffer) {
    setTempItem(newItem);
    scrollToDrawer(plat._id);
  } else {
    // Sinon, ajout direct au panier
    const result = addToCart(newItem, "SOIR");
    if (result === "LOCK_ERROR") {
      alert("Votre panier contient déjà des produits d'un autre service (MIDI).");
    }
  }
};

  const handleUpdateTempAcc = (accName: string) => {
    if (!tempItem) return;
    setTempItem({ ...tempItem, chosenAccompaniment: accName });
  };

  const handleAddTempSupp = (supp: { id: string, name: string, price: number }) => {
    if (!tempItem) return;
    const newSupp: CartSupplement = {
      id: supp.id, name: supp.name, price: supp.price, status: "pending"
    };
    setTempItem({
      ...tempItem,
      supplements: [...(tempItem.supplements || []), newSupp]
    });
    setAddedSuppId(supp.id);
    setTimeout(() => setAddedSuppId(null), 800);
  };

  const handleRemoveTempSupp = (suppId: string) => {
    if (!tempItem || !tempItem.supplements) return;
    const supps = [...tempItem.supplements];
    let targetIndex = -1;
    for (let i = supps.length - 1; i >= 0; i--) {
      if (supps[i].id === suppId) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex !== -1) {
      supps.splice(targetIndex, 1);
      setTempItem({ ...tempItem, supplements: supps });
    }
  };

  const handleConfirmAddition = () => {
  if (!tempItem) return;

  // Récupération de l'objet plat d'origine pour vérifier l'offre
  const platOrigine = platsDuSoir.find(p => p._id === tempItem.id);
  
  let itemToSave = { ...tempItem };

  // LOGIQUE DE PRIX : Si l'offre est atteinte, on peut marquer cet item 
  // pour que le CartContext sache qu'il doit appliquer le prix spécial.
  if (platOrigine?.offer?.enabled) {
    const countInCart = cart.filter(item => item.id === tempItem.id).length;
    if ((countInCart + 1) >= platOrigine.offer.requiredQuantity) {
      // Option A : On change le prix ici (mais attention à la 4ème bière)
      // La meilleure pratique est de laisser le CartContext calculer le total global
      // en cherchant les items de type "SOIR" qui ont une "offer"
    }
  }

  const result = addToCart(itemToSave, "SOIR");
  if (result === "LOCK_ERROR") {
    alert("Votre panier contient déjà des produits d'un autre service (MIDI).");
  } else {
    setTempItem(null);
  }
};

  const handleUniversChange = (newUnivers: "Cuisine" | "Boissons") => {
    if (isAnyDrawerOpen) return;
    setUnivers(newUnivers);
    setFilter("Tous");
  };

  // --- EFFET DE REBOND DE SCROLL ---
  useEffect(() => {
    if (tempItem) {
      const scrollContainer = document.querySelector('.drawer-body-scroll');
      if (scrollContainer) {
        const timer = setTimeout(() => {
          scrollContainer.classList.add('hint-active');
          setTimeout(() => {
            scrollContainer.classList.remove('hint-active');
          }, 2000); 
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [tempItem]);

  if (isLoadingMenu) {
    return (
      <div className="menu-soir-loading">
        <Loader2 className="animate-spin" size={40} color="#d4af37" />
        <p>Mise en place de l'expérience nocturne...</p>
      </div>
    );
  }

  return (
    <section className="menu-soir-section">
      {isAnyDrawerOpen && <div className="global-drawer-overlay" />}

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
          <button className={`univers-btn-soir ${univers === "Cuisine" ? "active" : ""} ${isAnyDrawerOpen ? "disabled-btn" : ""}`} onClick={() => handleUniversChange("Cuisine")}>
            <Utensils size={18} /> La Table
          </button>
          <button className={`univers-btn-soir ${univers === "Boissons" ? "active" : ""} ${isAnyDrawerOpen ? "disabled-btn" : ""}`} onClick={() => handleUniversChange("Boissons")}>
            <GlassWater size={18} /> La Cave
          </button>
        </div>
      </div>

      <div className="menu-filtres-soir-container">
        <div className="menu-filtres-track-soir">
          <div className="menu-filtres-list-soir">
            {currentCategories.map((cat, idx) => (
              <button key={idx} className={`filter-btn-soir ${filter === cat ? "active" : ""} ${isAnyDrawerOpen ? "disabled-btn" : ""}`} onClick={() => !isAnyDrawerOpen && setFilter(cat as string)}>
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
          const isExpanding = tempItem?.id === plat._id; 
          const quantityInCart = getItemQuantity(plat._id);
          const orderMatch = activeOrders.find((order: any) => 
            order.items.some((item: any) => item.productId === plat._id)
          );
          
          let currentStatus = null;
          if (orderMatch) {
            const status = orderMatch.status;
            const lastUpdate = new Date(orderMatch.updatedAt || orderMatch.createdAt).getTime();
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;
            if (status === "archived") { currentStatus = null; } 
            else if (status === "done" && (now - lastUpdate > tenMinutes)) { currentStatus = null; } 
            else { currentStatus = status; }
          } 
          
          if (!currentStatus && itemsInCart.length > 0) {
            currentStatus = "in_cart"; 
          }

          const suppsToShow = plat.allowSupplements 
            ? (supplementsList?.filter(s => s.active) || []) 
            : (plat.supplements?.filter(s => s.active) || []);

          return (
            <div key={plat._id} className={`menu-card-outer soir-variant ${isExpanding ? "is-expanded" : ""}`}>
              <div className={`menu-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                
                <div className="card-face-soir card-front-soir">
                  <div className="menu-image-container">
                    {currentStatus && <OrderStatusBadge status={currentStatus} />}

                    {/* RUBAN OFFRE (BIÈRES/FORMULES) */}
                    {plat.offer?.enabled && (
                      <div className="luxury-offer-ribbon">
                        <Sparkles size={10} className="ribbon-icon" />
                        <span>Offre dès {plat.offer.requiredQuantity}</span>
                      </div>
                    )}

                    {plat.image ? <img src={plat.image} alt={plat.name} className="menu-img" /> : <div className="placeholder-soir">Signature</div>}
                    <div className="price-tag-evening"><span>{plat.price}€</span></div>
                  </div>

                  <div className="details-container-soir">
                    <h3>{plat.name}</h3>
                    <div className="gold-separator"></div>
                    <p className="description-preview-soir">{plat.description}</p>
                    <button className="view-details-btn-soir" onClick={() => !isAnyDrawerOpen && setFlippedId(plat._id)}>Voir plus...</button>

                    <div className="card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
  
  {/* BOUTON AJOUTER (Principal) */}
  <button 
    className={`btn-add-soir ${isAnyDrawerOpen && !isExpanding ? "btn-disabled" : ""} ${isExpanding ? "btn-configuring" : ""}`} 
    onClick={() => handleAddClick(plat)}
    style={{ width: '100%' }}
  >
    {isExpanding ? "Configuration..." : (
      <>
        <PlusCircle size={18} style={{ marginRight: '8px' }} />
        {quantityInCart > 0 ? `Ajouter (${quantityInCart})` : "Ajouter au panier"}
      </>
    )}
  </button>

  {/* BOUTON RETIRER (Visible uniquement si déjà dans le panier) */}
  {quantityInCart > 0 && !isExpanding && (
    <button 
      className="btn-remove-quick-soir"
      onClick={() => handleRemoveOne(plat._id)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase'
      }}
    >
      <MinusCircle size={18} />
      <span>Retirer un article</span>
    </button>
  )}
</div>
                  </div>

                  {/* TIROIR DE PERSONNALISATION / OFFRE */}
                  <div id={`drawer-${plat._id}`} className={`acc-selection-drawer ${isExpanding ? "open" : ""}`}>
                      <div className="drawer-header">
                        <div className="drawer-title">
                          <Sparkles size={14} color="#d4af37" /> <span>Personnalisation</span>
                        </div>
                        <button className="btn-cancel-config" onClick={() => setTempItem(null)}>
                          <Trash2 size={16} /> <span>Annuler</span>
                        </button>
                      </div>

                      <div className="drawer-body-scroll">
                        
                        {/* AFFICHAGE DE L'OFFRE ACTIVÉE DANS LE TIROIR */}
{plat.offer?.enabled && (quantityInCart + 1) >= plat.offer.requiredQuantity && (() => {
  const totalQtyAfterAdding = quantityInCart + 1;
  const nbLots = Math.floor(totalQtyAfterAdding / plat.offer.requiredQuantity);
  const reste = totalQtyAfterAdding % plat.offer.requiredQuantity;
  const prixTotal = (nbLots * plat.offer.offerPrice) + (reste * plat.price);

  // Calcul du prix sans l'offre
const prixNormal = totalQtyAfterAdding * plat.price;
// Calcul de l'économie (Différence entre prix normal et prix promo)
const economie = prixNormal - prixTotal;
  return (
    <div className="drawer-section offer-activation-zone">
  <div className="offer-congrats">
    <Sparkles size={18} className="ribbon-icon" />
    <span>Offre Signature Activée !</span>
  </div>
  
  <p className="offer-details">
    Vos <strong>{totalQtyAfterAdding} {plat.name}</strong> passent à <strong>{prixTotal.toFixed(2)}€</strong>
  </p>

  {/* Affichage de l'économie */}
  {economie > 0 && (
    <p className="offer-subtext" style={{ color: '#4ade80', fontWeight: 'bold', marginTop: '5px' }}>
      Vous économisez immédiatement {economie.toFixed(2)}€
    </p>
  )}
</div>
  );
})()}

                        {(plat.accompaniments?.filter(a => a.active).length || 0) > 0 && (
                          <div className="drawer-section">
                            <p className="drawer-label">Accompagnement (Gratuit)</p>
                            <div className="acc-options-grid">
                              <button className={`acc-mini-choice ${tempItem?.chosenAccompaniment === "Aucun" ? "selected" : ""}`} onClick={() => handleUpdateTempAcc("Aucun")}>Aucun</button>
                              <button className={`acc-mini-choice ${tempItem?.chosenAccompaniment === "Standard" ? "selected" : ""}`} onClick={() => handleUpdateTempAcc("Standard")}>Standard</button>
                              {plat.accompaniments?.filter(a => a.active).map(acc => (
                                <button key={acc._id} className={`acc-mini-choice ${tempItem?.chosenAccompaniment === acc.name ? "selected" : ""}`} onClick={() => handleUpdateTempAcc(acc.name)}>{acc.name}</button>
                              ))}
                            </div>
                          </div>
                        )}

                        {suppsToShow.length > 0 && (
                          <div className="drawer-section">
                            <p className="drawer-label">Extras (Payant)</p>
                            <div className="supps-list-container">
                              {isLoadingSupps ? <Loader2 className="animate-spin" /> : suppsToShow.map(supp => {
                                const count = tempItem?.supplements?.filter(s => s.id === supp._id).length || 0;
                                return (
                                  <div key={supp._id} className="supp-card-mini">
                                    <div className="supp-mini-info">
                                      <span className="supp-mini-name">{supp.name}</span>
                                      <span className="supp-mini-price">+{supp.price}€</span>
                                    </div>
                                    <div className="supp-actions-wrapper">
                                      {count > 0 && (
                                        <button className="supp-mini-remove" onClick={() => handleRemoveTempSupp(supp._id)}>
                                          <MinusCircle size={20} />
                                        </button>
                                      )}
                                      {count > 0 && <span className="supp-count-badge">{count}</span>}
                                      <button 
                                        className={`supp-mini-add ${addedSuppId === supp._id ? "success" : ""}`} 
                                        onClick={() => handleAddTempSupp({ id: supp._id, name: supp.name, price: supp.price })}
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
                        <button type="button" className="btn-confirm-drawer" onClick={handleConfirmAddition}>
                          <Check size={20} /> Terminer et ajouter
                        </button>
                      </div>
                  </div>
                </div>

                <div className="card-face-soir card-back-soir">
                  <button className="close-back-btn-soir" onClick={() => setFlippedId(null)}><X size={20} /></button>
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
                    <div className="back-body-soir"><p className="full-description-soir">{plat.description}</p></div>
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