import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Smartphone, CheckCircle, ExternalLink, Bike, Trash2 } from "lucide-react"; 
import axios from "axios";
import "./cart.css";

// Configuration de l'URL API
const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  
  // États de base
  const [orderMode, setOrderMode] = useState<"on_site" | "booking" | "delivery">("on_site");
  const [consumeMode, setConsumeMode] = useState<"dine_in" | "take_away">("dine_in");
  const [payNow, setPayNow] = useState<boolean>(true);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // ÉTATS DES TABLES
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  
  // États Formulaire
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState(""); 
  const [guestCount, setGuestCount] = useState("2");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [minTime, setMinTime] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  // ÉTATS UBER DIRECT
  const [deliveryQuote, setDeliveryQuote] = useState<{fee: number, id: string} | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const PARTNER_LINKS = {
    uberEats: "https://www.ubereats.com/store/votre-restaurant",
    deliveroo: "https://deliveroo.fr/menu/paris/votre-restaurant",
    justEat: "https://www.just-eat.fr/restaurant/votre-restaurant"
  };

  // 1. CHARGEMENT DES TABLES
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get(`${BASE_API}/tables`);
        const activeTables = res.data.data.filter((t: any) => t.active);
        setTables(activeTables);
      } catch (err) {
        console.error("Erreur récupération tables:", err);
      }
    };
    fetchTables();
  }, []);

  // Logique temps minimum livraison
  useEffect(() => {
    const updateMinTime = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 90); 
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      setMinTime(formattedTime);
      if (!deliveryTime) setDeliveryTime(formattedTime);
    };
    updateMinTime();
    const interval = setInterval(updateMinTime, 60000);
    return () => clearInterval(interval);
  }, [deliveryTime]);

  // Réinitialisation modes
  useEffect(() => {
    if (orderMode !== "delivery") {
      setDeliveryQuote(null);
      setDeliveryError(null);
    }
    if (consumeMode !== "dine_in") {
        setSelectedTable("");
    }
  }, [orderMode, consumeMode]);

  // LOGIQUE UBER DIRECT
  const fetchDeliveryQuote = async (targetAddress: string) => {
    if (targetAddress.trim().length < 10) return;
    setIsEstimating(true);
    setDeliveryError(null);
    try {
      const response = await axios.post(`${BASE_API}/uber/estimate`, { address: targetAddress });
      setDeliveryQuote({ fee: response.data.fee, id: response.data.quoteId });
    } catch (err: any) {
      setDeliveryError(err.response?.data?.details || "Adresse non desservie.");
      setDeliveryQuote(null);
    } finally {
      setIsEstimating(false);
    }
  };

  // CALCUL DU TOTAL
  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const basePriceStr = String(item.price || "0");
      const basePrice = parseFloat(basePriceStr.replace(/[^\d.]/g, "")) || 0;
      const supplementsPrice = (item.supplements || []).reduce((sAcc: number, s: any) => {
        const sPriceStr = String(s.price || "0");
        const sPrice = parseFloat(sPriceStr.replace(/[^\d.]/g, "")) || 0;
        return sAcc + sPrice;
      }, 0);
      return acc + basePrice + supplementsPrice;
    }, 0);
  };

  const totalPrice = calculateTotal();
  const depositAmount = totalPrice / 2;

  const getAmountToPay = () => {
    let base = totalPrice;
    if (orderMode === "on_site") base = payNow ? totalPrice : 0;
    if (orderMode === "booking") base = depositAmount;
    const shipping = (orderMode === "delivery" && deliveryQuote) ? deliveryQuote.fee : 0;
    return base + shipping;
  };

  /**
   * ACTION FINALE : ENVOI À L'ADMINISTRATION
   */
  const handleFinalOrder = async () => {
  setIsSubmitting(true);
  
  // 1. Récupération du ClientID (pour le suivi sur la carte)
  let clientId = localStorage.getItem('signature_client_id');
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('signature_client_id', clientId);
  }

  // 2. Préparation des items avec productId pour le voyant de la carte
  // On utilise 'any' pour éviter l'erreur sur _id
  const itemsForAdmin = cart.map((item: any) => ({
    productId: item.id || item._id, // Identifiant unique du plat
    name: item.name,
    price: item.price,
    chosenAccompaniment: item.chosenAccompaniment || "Aucun",
    supplements: item.supplements || [],
    type: item.type || 'Signature'
  }));

  // 3. Construction de l'objet selon ton OrderRoutes.js
  const orderData = {
    clientId: clientId,
    customer: {
      name: customerName || "Client Signature",
      address: orderMode === "delivery" ? address : "Sur place",
    },
    items: itemsForAdmin, 
    total: totalPrice,
    amountPaid: getAmountToPay(),
    mode: orderMode,
    // On utilise 'pending' car c'est ce que ton Enum backend autorise
    status: "pending", 
    details: {
      consumeMode: orderMode === "on_site" ? consumeMode : null,
      tableNumber: selectedTable || null,
      guestCount: orderMode === "booking" ? guestCount : null,
      bookingSlot: orderMode === "booking" ? `${bookingDate} ${bookingTime}` : null,
      deliveryTime: orderMode === "delivery" ? deliveryTime : null,
      paymentStatus: payNow ? "paid" : "pending_at_counter"
    }
  };

  try {
    // 4. Envoi au backend
    const response = await axios.post(`${BASE_API}/orders`, orderData);
    
    if (response.data.success) {
      setOrderSuccess(true);
      // 5. Vidage du panier
      // Le produit disparaît du panier mais le voyant "En attente" 
      // apparaîtra sur la carte car le clientId est en DB avec status: 'pending'
      clearCart();
    }
  } catch (error: any) {
    console.error("Détails de l'erreur:", error.response?.data);
    alert(`Erreur : ${error.response?.data?.message || "Veuillez vérifier les informations"}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const isOrderDisabled = () => {
    if (!isAgreed || isSubmitting) return true;
    if (orderMode === 'delivery' && !deliveryQuote) return true;
    if (orderMode === 'on_site' && consumeMode === 'dine_in' && !selectedTable) return true;
    if ((orderMode === 'delivery' || orderMode === 'booking') && !customerName) return true;
    return false;
  };

  if (orderSuccess) {
    return (
      <div className="empty-cart success-view">
        <CheckCircle size={60} color="#D4AF37" />
        <h2>Commande Confirmée !</h2>
        <p>Merci pour votre confiance. Nous préparons votre sélection Signature.</p>
        <Link to="/" className="return-btn">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-banner-box">
        <div className="cart-header">
          <div className="header-seal">C</div>
          <span className="cart-badge">Votre Sélection</span>
          <h2 className="cart-main-title">Votre Panier</h2>
          <div className="header-double-line"></div>
        </div>
      </div>

      <div className="cart-container">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Votre panier est actuellement vide.</p>
            <div className="title-underline-gold"></div>
            <Link to="/carte" className="return-btn">Retour à la Carte</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-left-side">
              <div className="cart-table-header">
                <span>Produit</span>
                <span>Prix</span>
                <span className="text-center">Action</span>
              </div>
              
              <div className="cart-items-list">
                {cart.map((item, index) => {
                  const itemBase = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  const itemSupps = item.supplements?.reduce((a:any, b:any) => a + parseFloat(b.price), 0) || 0;
                  const itemTotal = itemBase + itemSupps;

                  return (
                    <div key={item.cartItemId || `${item.id}-${index}`} className="cart-item">
                      <div className="item-info">
                        <div className="item-details">
                          <div className="item-main-row">
                            <h4>{item.name}</h4>
                            <span className="badge-type">{item.type || 'Signature'}</span>
                          </div>
                          
                          {item.chosenAccompaniment && item.chosenAccompaniment !== "Aucun" && (
                            <p className="item-meta">Accompagnement : <strong>{item.chosenAccompaniment}</strong></p>
                          )}

                          {item.supplements && item.supplements.length > 0 && (
                            <div className="item-supps-list">
                              {item.supplements.map((s: any, i: number) => (
                                <span key={i} className="cart-supp-tag">+{s.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="item-price">{itemTotal.toFixed(2)}€</span>
                      <button 
                        className="cart-remove-btn" 
                        onClick={() => removeFromCart(item.cartItemId || item.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="order-options-box">
                <h3 className="options-title">Comment souhaitez-vous commander ?</h3>
                <div className="selection-grid">
                  <button className={`select-btn ${orderMode === "on_site" ? "active" : ""}`} onClick={() => setOrderMode("on_site")}>📍 En salle</button>
                  <button className={`select-btn ${orderMode === "booking" ? "active" : ""}`} onClick={() => setOrderMode("booking")}>📅 Réserver</button>
                  <button className={`select-btn ${orderMode === "delivery" ? "active" : ""}`} onClick={() => setOrderMode("delivery")}>🚲 Livraison</button>
                </div>

                <div className="dynamic-form-container">
                  {orderMode === "on_site" && (
                    <div className="form-fade-in">
                      <p className="form-instruction">Type de consommation :</p>
                      <div className="selection-grid small" style={{marginBottom: '20px'}}>
                        <button className={`select-btn ${consumeMode === "dine_in" ? "active" : ""}`} onClick={() => setConsumeMode("dine_in")}>🍽️ Sur place</button>
                        <button className={`select-btn ${consumeMode === "take_away" ? "active" : ""}`} onClick={() => setConsumeMode("take_away")}>🥡 À emporter</button>
                      </div>

                      {consumeMode === "dine_in" && (
                        <div className="table-selector-box form-fade-in">
                          <div className="table-header-select">
                             <Smartphone size={18} color="#D4AF37" />
                             <label>Votre numéro de table :</label>
                          </div>
                          <select className="luxury-select" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                            <option value="">-- Sélectionnez une table --</option>
                            {tables.map(t => <option key={t._id} value={t.number}>Table n°{t.number}</option>)}
                          </select>
                        </div>
                      )}

                      <p className="form-instruction" style={{marginTop: '20px'}}>Règlement :</p>
                      <div className="selection-grid small">
                        <button className={`select-btn ${payNow ? "active" : ""}`} onClick={() => setPayNow(true)}>💳 En ligne</button>
                        <button className={`select-btn ${!payNow ? "active" : ""}`} onClick={() => setPayNow(false)}>💵 À la caisse</button>
                      </div>
                    </div>
                  )}

                  {orderMode === "delivery" && (
                    <div className="form-fade-in">
                      <p className="form-instruction">Commander via nos partenaires :</p>
                      <div className="selection-grid partners-grid" style={{marginBottom: '25px', gridTemplateColumns: 'repeat(3, 1fr)'}}>
                        <a href={PARTNER_LINKS.uberEats} target="_blank" rel="noreferrer" className="select-btn partner-btn">Uber <ExternalLink size={12} /></a>
                        <a href={PARTNER_LINKS.deliveroo} target="_blank" rel="noreferrer" className="select-btn partner-btn">Deliveroo <ExternalLink size={12} /></a>
                        <a href={PARTNER_LINKS.justEat} target="_blank" rel="noreferrer" className="select-btn partner-btn">Just Eat <ExternalLink size={12} /></a>
                      </div>

                      <div className="delivery-separator" style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
                         <div style={{flex:1, height:'1px', background:'rgba(212,175,55,0.3)'}}></div>
                         <span style={{fontSize:'0.7rem', color:'#D4AF37', letterSpacing:'1px'}}>OU LIVRAISON SIGNATURE</span>
                         <div style={{flex:1, height:'1px', background:'rgba(212,175,55,0.3)'}}></div>
                      </div>

                      <div className="input-group full">
                        <label>Nom complet</label>
                        <input type="text" placeholder="Votre nom" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label><Bike size={14} style={{marginRight:'5px'}}/> Adresse de livraison</label>
                        <input type="text" placeholder="Rue, code postal, ville..." value={address} onChange={(e) => setAddress(e.target.value)} onBlur={() => fetchDeliveryQuote(address)} />
                        {isEstimating && <small className="gold-text">Estimation en cours...</small>}
                        {deliveryError && <small className="error-text">{deliveryError}</small>}
                        {deliveryQuote && <small className="success-text">✓ Zone desservie</small>}
                      </div>
                      <div className="input-group full">
                        <label>Heure souhaitée</label>
                        <input type="time" min={minTime} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {orderMode === "booking" && (
                    <div className="form-fade-in">
                      <div className="input-group full">
                        <label>Nom de la réservation</label>
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label>Nombre de convives</label>
                        <select className="luxury-select" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num} {num > 1 ? 'Personnes' : 'Personne'}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <div className="input-group">
                            <label>Date</label>
                            <input type="date" min={new Date().toISOString().split("T")[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Heure</label>
                            <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="cart-summary">
              <h3 className="summary-title">Récapitulatif</h3>
              <div className="summary-line">
                <span>Mode choisi</span>
                <span className="gold-text">
                  {orderMode === "on_site" && (consumeMode === "dine_in" ? "Sur place" : "À emporter")}
                  {orderMode === "booking" && "Réservation"}
                  {orderMode === "delivery" && "Livraison Signature"}
                </span>
              </div>

              <div className="summary-line">
                <span>Total Plats + Options</span>
                <span>{totalPrice.toFixed(2)}€</span>
              </div>

              {orderMode === "delivery" && deliveryQuote && (
                <div className="summary-line">
                  <span>Frais de livraison</span>
                  <span className="gold-text">+{deliveryQuote.fee.toFixed(2)}€</span>
                </div>
              )}

              <div className="summary-line total">
                <span>À payer :</span>
                <span>{getAmountToPay().toFixed(2)}€</span>
              </div>

              <div className="legal-notice">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                  Ma commande est <strong>non-remboursable</strong>.
                </label>
              </div>

              <button 
                className={`checkout-btn ${isOrderDisabled() ? "disabled" : ""}`} 
                disabled={isOrderDisabled()}
                onClick={handleFinalOrder}
              >
                {isSubmitting ? "Traitement..." : "Confirmer la commande"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}