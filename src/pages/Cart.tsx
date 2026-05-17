import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { 
  Smartphone, 
  Bike, 
  Trash2, 
  ShoppingBag,
  Sparkles,
  UtensilsCrossed
} from "lucide-react"; 
import axios from "axios";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../services/firebase";

import "./cart.css";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

const VAPID_KEY = "BOmQ73MJH6SreFfExPUgCXuuUpEnR1zwqGGC2LWs6yqZvpjy3yWlHtcOX9LBLVMcEBq9FtwqB2OG1Z-j8TxPjdQ";

type DeliveryService = "signature" | null;

export default function Cart() {
  const [orderMode, setOrderMode] = useState<"on_site" | "booking" | "delivery">("on_site");
  const [consumeMode, setConsumeMode] = useState<"dine_in" | "take_away">("dine_in");
  
  // ⚠️ payNow n'est plus utilisé pour dine_in — gardé uniquement pour take_away
  const [payNow, setPayNow] = useState<boolean>(true);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { cart, removeFromCart, getCartTotal, getCartSavings } = useCart();
  
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState(""); 
  const [guestCount] = useState("2");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [minTime, setMinTime] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const [selectedDeliveryService, setSelectedDeliveryService] = useState<DeliveryService>(null);
  const [deliveryQuote, setDeliveryQuote] = useState<{fee: number, id: string, service: string} | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const deliveryFees = {
    signature: { fee: 5, label: "Livraison Signature", icon: "✨", needsEstimate: false }
  };

  // ─── Détermine si c'est une "tab ouverte" (sur place, assis à une table) ───
  const isOpenTab = orderMode === "on_site" && consumeMode === "dine_in";

  useEffect(() => {
    const saveFcmToken = async () => {
      if (Notification.permission === 'granted') {
        try {
          const messaging = getMessaging(app);
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) localStorage.setItem('fcm_client_token', token);
        } catch (e) {
          console.error('❌ Erreur récupération token FCM:', e);
        }
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          try {
            const messaging = getMessaging(app);
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) localStorage.setItem('fcm_client_token', token);
          } catch (e) {
            console.error('❌ Erreur récupération token FCM:', e);
          }
        }
      }
    };
    saveFcmToken();
  }, []);

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

  useEffect(() => {
    if (orderMode !== "delivery") {
      setDeliveryQuote(null);
      setDeliveryError(null);
      setSelectedDeliveryService(null);
    }
    if (consumeMode !== "dine_in") {
      setSelectedTable("");
    }
  }, [orderMode, consumeMode]);

  const handleDeliveryServiceChange = (service: DeliveryService) => {
    setSelectedDeliveryService(service);
    if (service === "signature") {
      setDeliveryQuote({ fee: 5, id: "signature_delivery", service: "signature" });
      setDeliveryError(null);
    }
  };

  const parsePrice = (val: any) => {
    const str = String(val || "0");
    return parseFloat(str.replace(/[^\d.]/g, "")) || 0;
  };

  const totalPrice = getCartTotal(); 
  const savings = getCartSavings();  
  const depositAmount = totalPrice / 2;

  const getAmountToPay = () => {
    // ─── Sur place assis : RIEN à payer maintenant (tab ouverte) ───
    if (isOpenTab) return 0;

    let base = totalPrice;
    if (orderMode === "on_site") base = payNow ? totalPrice : 0; // take_away uniquement
    if (orderMode === "booking") base = depositAmount;
    const shipping = (orderMode === "delivery" && deliveryQuote) ? deliveryQuote.fee : 0;
    return base + shipping;
  };

  const amountToPay = getAmountToPay();
  const shouldShowEmailFields = !isOpenTab && (payNow === true || orderMode === "booking") && amountToPay > 0;

  const handleFinalOrder = async () => {
    setIsSubmitting(true);
    
    const fcmToken = localStorage.getItem('fcm_client_token');
    
    let clientId = localStorage.getItem('signature_client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('signature_client_id', clientId);
    }

    const currentAmountToPay = getAmountToPay();

    // ─── Pour une tab ouverte : pas de paiement, status direct "pending" ───
    const needsPayment = !isOpenTab && currentAmountToPay > 0 && (payNow === true || orderMode === "booking");
    
    const orderData = {
      clientId,
      fcmToken: fcmToken || null,
      customer: {
        name: customerName || "Client Signature",
        email: customerEmail,
        phone: customerPhone,
        address: orderMode === "delivery" ? address : "Sur place",
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
      amountPaid: currentAmountToPay,
      mode: orderMode,
      // ─── Tab ouverte → "pending" directement, pas de pending_payment ───
      status: needsPayment ? "pending_payment" : "pending",
      details: {
        consumeMode: orderMode === "on_site" ? consumeMode : null,
        tableNumber: selectedTable || null,
        guestCount: orderMode === "booking" ? guestCount : null,
        bookingSlot: orderMode === "booking" ? `${bookingDate} ${bookingTime}` : null,
        deliveryTime: orderMode === "delivery" ? deliveryTime : null,
        // ─── Tab ouverte → open_tab, sinon logique habituelle ───
        paymentStatus: isOpenTab ? "open_tab" : needsPayment ? "pending_stripe" : "pending_at_counter",
        deliveryService: deliveryQuote?.service || null,
        deliveryQuoteId: deliveryQuote?.id || null,
        deliveryFee: deliveryQuote?.fee || 0,
        customerEmail,
        customerPhone
      }
    };

    try {
      const response = await axios.post(`${BASE_API}/orders`, orderData);
      
      if (response.data.success) {
        const orderId = response.data.order?._id || 
                        response.data.order?.id || 
                        response.data.data?._id ||
                        response.data.orderId;
        
        if (!orderId) {
          alert("Erreur: L'ID de la commande n'a pas été retourné");
          setIsSubmitting(false);
          return;
        }
        
        // ─── Tab ouverte : notification immédiate + redirect success ───
        if (isOpenTab || !needsPayment) {
          try {
            await axios.post(`${BASE_API}/notifications/new-order`, {
              orderId,
              customerName: customerName || "Client Signature",
              total: totalPrice.toFixed(2),
              itemsCount: cart.length,
              mode: isOpenTab ? "Sur place (table ouverte)" : "Sur place",
              tableNumber: selectedTable || null,
              paymentMethod: isOpenTab ? "Addition en fin de repas" : "Caisse"
            });
          } catch (notifError: any) {
            console.error("❌ Erreur envoi notification:", notifError.message);
          }
          
          window.location.href = `/order-success?orderId=${orderId}`;
        } else {
          // Paiement Stripe (take_away en ligne, booking, delivery)
          const stripeItems = cart.map((item: any) => {
            const unitPrice = parsePrice(item.price);
            const supplementsTotal = item.supplements?.reduce((sum: number, supp: any) => {
              return sum + parsePrice(supp.price);
            }, 0) || 0;
            const itemTotal = (unitPrice + supplementsTotal) * (item.quantity || 1);
            const finalPrice = orderMode === "booking" ? itemTotal / 2 : itemTotal;
            
            return {
              name: item.name,
              price: finalPrice,
              quantity: 1,
              chosenAccompaniment: item.chosenAccompaniment || "Aucun"
            };
          });
          
          const paymentResponse = await axios.post(`${BASE_API}/payments/create-checkout-session`, {
            items: stripeItems,
            orderId,
            mode: orderMode,
            depositPercentage: orderMode === "booking" ? 50 : 100
          });
          
          if (paymentResponse.data.url) {
            window.location.href = paymentResponse.data.url;
          } else {
            alert("Erreur lors de la redirection Stripe");
            setIsSubmitting(false);
          }
        }
      } else {
        alert(`Erreur: ${response.data.message || "Commande non créée"}`);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      alert(`Erreur : ${error.response?.data?.message || error.message}`);
      setIsSubmitting(false);
    } 
  };

  const isOrderDisabled = () => {
    if (!isAgreed || isSubmitting) return true;
    
    if (orderMode === 'delivery') {
      if (!selectedDeliveryService || !deliveryQuote) return true;
      if (!customerName?.trim() || !customerPhone?.trim()) return true;
      if (!address || address.trim().length < 10) return true;
    }
    
    if (orderMode === 'booking') {
      if (!customerName?.trim()) return true;
      if (!customerEmail?.includes('@')) return true;
      if (!customerPhone?.trim()) return true;
      if (!bookingDate || !bookingTime) return true;
    }
    
    if (orderMode === 'on_site') {
      // dine_in : seulement la table obligatoire, pas d'email
      if (consumeMode === 'dine_in' && !selectedTable) return true;
      // take_away : si paiement en ligne, email obligatoire
      if (consumeMode === 'take_away' && payNow && !customerEmail?.includes('@')) return true;
    }
    
    if (shouldShowEmailFields && !customerEmail?.includes('@')) return true;
    
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

                      {/* ─── DINE_IN : table ouverte, pas de paiement immédiat ─── */}
                      {consumeMode === "dine_in" && (
                        <div className="form-fade-in">
                          <div className="table-selector-box">
                            <div className="table-header-select">
                              <Smartphone size={18} color="#D4AF37" />
                              <label>Numéro de table :</label>
                            </div>
                            <select className="luxury-select" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                              <option value="">-- Sélectionnez votre table --</option>
                              {tables.map(t => <option key={t._id} value={t.number}>Table n°{t.number}</option>)}
                            </select>
                          </div>

                          {/* Bandeau informatif "tab ouverte" */}
                          <div className="open-tab-info-banner">
                            <UtensilsCrossed size={18} color="#D4AF37" />
                            <div>
                              <strong>Commande sur table ouverte</strong>
                              <p>Vous pouvez commander autant de fois que vous le souhaitez. L'addition sera présentée en fin de repas, à votre demande ou par votre serveur.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─── TAKE_AWAY : paiement immédiat comme avant ─── */}
                      {consumeMode === "take_away" && (
                        <div className="form-fade-in">
                          <p className="form-instruction">Règlement :</p>
                          <div className="selection-grid small">
                            <button className={`select-btn ${payNow ? "active" : ""}`} onClick={() => setPayNow(true)}>💳 En ligne</button>
                            <button className={`select-btn ${!payNow ? "active" : ""}`} onClick={() => setPayNow(false)}>💵 À la caisse</button>
                          </div>
                          
                          {payNow && amountToPay > 0 && (
                            <div className="input-group full">
                              <label>Email * (pour le reçu)</label>
                              <input type="email" placeholder="votre@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {orderMode === "delivery" && (
                    <div className="form-fade-in">
                      <div className="input-group full">
                        <label>Nom complet *</label>
                        <input type="text" placeholder="Votre nom" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label>Téléphone *</label>
                        <input type="tel" placeholder="Votre numéro de téléphone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label>Email</label>
                        <input type="email" placeholder="votre@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label><Bike size={14}/> Adresse de livraison *</label>
                        <input type="text" placeholder="Adresse précise..." value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                      <div className="delivery-services-section">
                        <label className="section-label">Choisissez votre service de livraison :</label>
                        <div className="delivery-services-grid">
                          <button
                            type="button"
                            className={`delivery-service-btn signature ${selectedDeliveryService === "signature" ? "active" : ""}`}
                            onClick={() => handleDeliveryServiceChange("signature")}
                          >
                            <span className="service-icon">✨</span>
                            <span className="service-name">Livraison Signature</span>
                            <span className="service-price">5.00€</span>
                          </button>
                        </div>
                      </div>
                      {deliveryError && <small className="error-text">{deliveryError}</small>}
                      {deliveryQuote && !deliveryError && (
                        <div className="delivery-quote-success">
                          <Sparkles size={16} />
                          <span>✨ Livraison Signature : 5.00€ ajoutés à votre commande</span>
                        </div>
                      )}
                      <div className="input-group full">
                        <label>Heure souhaitée (min {minTime})</label>
                        <input type="time" min={minTime} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {orderMode === "booking" && (
                    <div className="form-fade-in">
                      <div className="input-group full">
                        <label>Nom complet *</label>
                        <input type="text" placeholder="Votre nom" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label>Email *</label>
                        <input type="email" placeholder="votre@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label>Téléphone *</label>
                        <input type="tel" placeholder="Votre numéro de téléphone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                      </div>
                      <div className="form-row">
                        <div className="input-group">
                          <label>Date *</label>
                          <input type="date" min={new Date().toISOString().split("T")[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                        </div>
                        <div className="input-group">
                          <label>Heure *</label>
                          <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                        </div>
                      </div>
                      <div className="info-badge">
                        <Sparkles size={14} />
                        <span>Un acompte de 50% vous sera demandé pour valider la réservation</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── RÉCAPITULATIF ─── */}
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
                  <span>Frais de livraison ({deliveryFees.signature.label})</span>
                  <span className="gold-text">+{deliveryQuote.fee.toFixed(2)}€</span>
                </div>
              )}

              {/* ─── Pour une tab ouverte : afficher le total sans "à payer maintenant" ─── */}
              {isOpenTab ? (
                <div className="summary-line total">
                  <span>Total de la commande :</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
              ) : (
                <div className="summary-line total">
                  <span>{orderMode === "booking" ? "Acompte (50%) :" : "À payer :"}</span>
                  <span>{amountToPay.toFixed(2)}€</span>
                </div>
              )}

              {isOpenTab && (
                <div className="open-tab-summary-note">
                  <UtensilsCrossed size={14} />
                  <span>Paiement à la fin du repas</span>
                </div>
              )}

              {orderMode === "booking" && (
                <div className="summary-line" style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  <span>Solde restant à payer sur place</span>
                  <span>{(totalPrice - amountToPay).toFixed(2)}€</span>
                </div>
              )}

              <div className="legal-notice">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                  J'accepte les conditions générales. Commande <strong>non-remboursable</strong>.
                </label>
              </div>

              <button 
                className={`checkout-btn ${isOrderDisabled() ? "disabled" : ""}`} 
                disabled={isOrderDisabled()}
                onClick={handleFinalOrder}
              >
                {isSubmitting
                  ? "Traitement..."
                  : isOpenTab
                    ? "Envoyer ma commande en cuisine"
                    : "Confirmer la commande"
                }
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .info-badge {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid #D4AF37;
          border-radius: 8px;
          padding: 10px 15px;
          margin-top: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #D4AF37;
        }

        /* ─── Bandeau tab ouverte ─── */
        .open-tab-info-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03));
          border: 1px solid rgba(212,175,55,0.4);
          border-left: 3px solid #D4AF37;
          border-radius: 10px;
          padding: 14px 16px;
          margin-top: 16px;
        }
        .open-tab-info-banner strong {
          display: block;
          color: #D4AF37;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        .open-tab-info-banner p {
          color: rgba(255,255,255,0.6);
          font-size: 0.78rem;
          line-height: 1.5;
          margin: 0;
        }

        /* ─── Note récap tab ouverte ─── */
        .open-tab-summary-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #D4AF37;
          opacity: 0.8;
          margin-top: 4px;
          margin-bottom: 8px;
        }
      `}</style>
    </section>
  );
}