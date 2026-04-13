import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { 
  Smartphone, 
  ExternalLink, 
  Bike, 
  Trash2, 
  ShoppingBag 
} from "lucide-react"; 
import axios from "axios";
import "./cart.css";

// Configuration de l'URL API
const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

export default function Cart() {
  // États de base
  const [orderMode, setOrderMode] = useState<"on_site" | "booking" | "delivery">("on_site");
  const [consumeMode, setConsumeMode] = useState<"dine_in" | "take_away">("dine_in");
  const [payNow, setPayNow] = useState<boolean>(true);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { cart, removeFromCart, clearCart, getCartTotal, getCartSavings } = useCart();
  
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
    uberEats: "https://www.ubereats.com/",
    deliveroo: "https://deliveroo.fr/",
    justEat: "https://www.just-eat.fr/"
  };

  // 1. CHARGEMENT DES TABLES
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get(`${BASE_API}/tables`);
        const rawData = res.data.data || res.data;
        const activeTables = Array.isArray(rawData) ? rawData.filter((t: any) => t.active) : [];
        setTables(activeTables);
      } catch (err) {
        console.error("Erreur récupération tables:", err);
      }
    };
    fetchTables();
  }, []);

  // 2. GESTION DU TEMPS MINIMUM (Livraison +90min)
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

  // 3. RÉINITIALISATION DES MODES
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
      setDeliveryError(err.response?.data?.details || "Adresse non desservie par notre service Signature.");
      setDeliveryQuote(null);
    } finally {
      setIsEstimating(false);
    }
  };

  // CALCULS
  const parsePrice = (val: any) => {
    const str = String(val || "0");
    return parseFloat(str.replace(/[^\d.]/g, "")) || 0;
  };

  const totalPrice = getCartTotal(); 
  const savings = getCartSavings();  
  const depositAmount = totalPrice / 2;

  const getAmountToPay = () => {
    let base = totalPrice;
    if (orderMode === "on_site") base = payNow ? totalPrice : 0;
    if (orderMode === "booking") base = depositAmount;
    const shipping = (orderMode === "delivery" && deliveryQuote) ? deliveryQuote.fee : 0;
    return base + shipping;
  };

  // ACTION FINALE
  const handleFinalOrder = async () => {
    setIsSubmitting(true);
    
    let clientId = localStorage.getItem('signature_client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('signature_client_id', clientId);
    }

    const orderData = {
      clientId: clientId,
      customer: {
        name: customerName || "Client Signature",
        address: orderMode === "delivery" ? address : "Vente à emporter / Sur place",
      },
      items: cart.map((item: any) => ({
        productId: item.id || item._id,
        name: item.name,
        price: parsePrice(item.price),
        quantity: item.quantity || 1,
        chosenAccompaniment: item.chosenAccompaniment || "Aucun",
        supplements: item.supplements || [],
        type: item.type || 'Signature'
      })), 
      total: totalPrice,
      amountPaid: getAmountToPay(),
      mode: orderMode,
      status: "pending", 
      details: {
        consumeMode: orderMode === "on_site" ? consumeMode : null,
        tableNumber: selectedTable || null,
        guestCount: orderMode === "booking" ? guestCount : null,
        bookingSlot: orderMode === "booking" ? `${bookingDate} ${bookingTime}` : null,
        deliveryTime: orderMode === "delivery" ? deliveryTime : null,
        paymentStatus: payNow ? "pending_stripe" : "pending_at_counter",
        uberQuoteId: deliveryQuote?.id || null
      }
    };

    try {
      const response = await axios.post(`${BASE_API}/orders`, orderData);
      
      if (response.data.success) {
        const orderId = response.data.data?._id || response.data.orderId;

        if (payNow || orderMode === "booking") {
          const paymentResponse = await axios.post(`${BASE_API}/payments/create-checkout-session`, {
            orderId: orderId,
            items: orderData.items,
            deliveryFee: (orderMode === "delivery" && deliveryQuote) ? deliveryQuote.fee : 0,
            amount: getAmountToPay(),
            customerName: customerName
          });

          if (paymentResponse.data.url) {
            window.location.href = paymentResponse.data.url;
          }
        } else {
          // Paiement comptoir : Redirection vers notre nouvelle page success
          window.location.href = `/order-success?orderId=${orderId}`;
        }
      }
    } catch (error: any) {
      console.error("Erreur commande:", error.response?.data);
      alert(`Erreur : ${error.response?.data?.message || "Veuillez vérifier vos informations"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOrderDisabled = () => {
    if (!isAgreed || isSubmitting) return true;
    if (orderMode === 'delivery' && !deliveryQuote) return true;
    if (orderMode === 'on_site' && consumeMode === 'dine_in' && !selectedTable) return true;
    if ((orderMode === 'delivery' || orderMode === 'booking') && !customerName) return true;
    if (orderMode === 'booking' && (!bookingDate || !bookingTime)) return true;
    return false;
  };

  return (
    <section className="cart-page">
      <div className="cart-banner-box">
        <div className="cart-header">
          <div className="header-seal">S</div>
          <span className="cart-badge">Votre Sélection</span>
          <h2 className="cart-main-title">Votre Panier</h2>
          <div className="header-double-line"></div>
        </div>
      </div>

      <div className="cart-container">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon-wrapper">
              <div className="icon-circle">
                <ShoppingBag size={40} strokeWidth={1} className="gold-bag" />
              </div>
              <div className="floating-sparkle s1">✦</div>
              <div className="floating-sparkle s2">✦</div>
            </div>
            <h3 className="empty-cart-title">Votre panier est vide</h3>
            <p className="empty-cart-subtitle">Laissez-vous tenter par nos créations culinaires.</p>
            <div className="title-underline-gold central"></div>
            <Link to="/carte" className="return-btn-premium">Découvrir la Carte</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-left-side">
              <div className="cart-table-header">
                <span>Produit</span>
                <span>Prix Total</span>
                <span className="text-center">Action</span>
              </div>
              
              <div className="cart-items-list">
                {cart.map((item, index) => {
                  const qty = item.quantity || 1;
                  const unitPrice = parsePrice(item.price) + (item.supplements?.reduce((a:any, b:any) => a + parsePrice(b.price), 0) || 0);
                  const itemTotal = unitPrice * qty;

                  return (
                    <div key={item.cartItemId || `${item.id}-${index}`} className="cart-item">
                      <div className="item-info">
                        <div className="item-details">
                          <div className="item-main-row">
                            <h4>{item.name} {qty > 1 && <span className="item-qty-badge">x{qty}</span>}</h4>
                            <span className="badge-type">{item.type || 'Signature'}</span>
                          </div>
                          {item.chosenAccompaniment && item.chosenAccompaniment !== "Aucun" && (
                            <p className="item-meta">Accompagnement : <span className="gold-text">{item.chosenAccompaniment}</span></p>
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
                      <div className="price-box" style={{textAlign: 'right'}}>
                        <span className="item-price">{itemTotal.toFixed(2)}€</span>
                      </div>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
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
                      <p className="form-instruction">Consommation :</p>
                      <div className="selection-grid small">
                        <button className={`select-btn ${consumeMode === "dine_in" ? "active" : ""}`} onClick={() => setConsumeMode("dine_in")}>🍽️ Sur place</button>
                        <button className={`select-btn ${consumeMode === "take_away" ? "active" : ""}`} onClick={() => setConsumeMode("take_away")}>🥡 À emporter</button>
                      </div>

                      {consumeMode === "dine_in" && (
                        <div className="table-selector-box form-fade-in">
                          <div className="table-header-select">
                             <Smartphone size={18} color="#D4AF37" />
                             <label>Numéro de table :</label>
                          </div>
                          <select className="luxury-select" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                            <option value="">-- Sélectionnez --</option>
                            {tables.map(t => <option key={t._id} value={t.number}>Table n°{t.number}</option>)}
                          </select>
                        </div>
                      )}

                      <p className="form-instruction">Règlement :</p>
                      <div className="selection-grid small">
                        <button className={`select-btn ${payNow ? "active" : ""}`} onClick={() => setPayNow(true)}>💳 En ligne</button>
                        <button className={`select-btn ${!payNow ? "active" : ""}`} onClick={() => setPayNow(false)}>💵 À la caisse</button>
                      </div>
                    </div>
                  )}

                  {orderMode === "delivery" && (
                    <div className="form-fade-in">
                      <div className="input-group full">
                        <label>Nom complet</label>
                        <input type="text" placeholder="Votre nom" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label><Bike size={14}/> Adresse de livraison</label>
                        <input type="text" placeholder="Adresse précise..." value={address} onChange={(e) => setAddress(e.target.value)} onBlur={() => fetchDeliveryQuote(address)} />
                        {isEstimating && <small className="gold-text">Calcul des frais...</small>}
                        {deliveryError && <small className="error-text">{deliveryError}</small>}
                        {deliveryQuote && <small className="success-text">✓ Livraison possible (+{deliveryQuote.fee.toFixed(2)}€)</small>}
                      </div>
                      <div className="input-group full">
                        <label>Heure souhaitée (min {minTime})</label>
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
                <span>Total Plats</span>
                <span>{(totalPrice + savings).toFixed(2)}€</span> 
              </div>

              {savings > 0 && (
                <div className="summary-line savings-row" style={{ color: "#27ae60", fontWeight: "bold" }}>
                  <span>Réduction</span>
                  <span>-{savings.toFixed(2)}€</span>
                </div>
              )}

              {orderMode === "delivery" && deliveryQuote && (
                <div className="summary-line">
                  <span>Frais de livraison</span>
                  <span className="gold-text">+{deliveryQuote.fee.toFixed(2)}€</span>
                </div>
              )}

              <div className="summary-line total">
                <span>{orderMode === "booking" ? "Acompte (50%) :" : "À payer :"}</span>
                <span>{getAmountToPay().toFixed(2)}€</span>
              </div>

              <div className="legal-notice">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                  Commande <strong>non-remboursable</strong>.
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