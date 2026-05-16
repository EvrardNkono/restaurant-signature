import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { 
  Smartphone, 
  Bike, 
  Trash2, 
  ShoppingBag,
  Sparkles
} from "lucide-react"; 
import axios from "axios";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../services/firebase";

import "./cart.css";

// Configuration de l'URL API
const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

// Clé VAPID pour FCM
const VAPID_KEY = "BOmQ73MJH6SreFfExPUgCXuuUpEnR1zwqGGC2LWs6yqZvpjy3yWlHtcOX9LBLVMcEBq9FtwqB2OG1Z-j8TxPjdQ";

// Types pour les services de livraison
type DeliveryService = "uber" | "deliveroo" | "justeat" | "signature" | null;

export default function Cart() {
  // États de base
  const [orderMode, setOrderMode] = useState<"on_site" | "booking" | "delivery">("on_site");
  const [consumeMode, setConsumeMode] = useState<"dine_in" | "take_away">("dine_in");
  const [payNow, setPayNow] = useState<boolean>(true);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { cart, removeFromCart, getCartTotal, getCartSavings } = useCart();
  
  // ÉTATS DES TABLES
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  
  // États Formulaire
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState(""); 
  const [guestCount] = useState("2");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [minTime, setMinTime] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  // ÉTATS LIVRAISON MULTI-SERVICES
  const [selectedDeliveryService, setSelectedDeliveryService] = useState<DeliveryService>(null);
  const [deliveryQuote, setDeliveryQuote] = useState<{fee: number, id: string, service: string} | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Configuration des frais de livraison par service
  const deliveryFees = {
    // uber: { fee: 0, label: "Uber Eats", icon: "🚲", needsEstimate: true },
    // deliveroo: { fee: 0, label: "Deliveroo", icon: "🛵", needsEstimate: true },
    // justeat: { fee: 0, label: "Just Eat", icon: "🍔", needsEstimate: true },
    signature: { fee: 5, label: "Livraison Signature", icon: "✨", needsEstimate: false }
  };

  // SAUVEGARDE DU TOKEN FCM
  useEffect(() => {
    const saveFcmToken = async () => {
      if (Notification.permission === 'granted') {
        try {
          const messaging = getMessaging(app);
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) {
            localStorage.setItem('fcm_client_token', token);
            console.log('✅ Token FCM sauvegardé:', token);
          }
        } catch (e) {
          console.error('❌ Erreur récupération token FCM:', e);
        }
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          try {
            const messaging = getMessaging(app);
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
              localStorage.setItem('fcm_client_token', token);
              console.log('✅ Token FCM sauvegardé après permission:', token);
            }
          } catch (e) {
            console.error('❌ Erreur récupération token FCM:', e);
          }
        }
      }
    };
    saveFcmToken();
  }, []);

  // CHARGEMENT DES TABLES
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

  // GESTION DU TEMPS MINIMUM (Livraison +90min)
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

  // RÉINITIALISATION DES MODES
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

  // Fonction pour obtenir le devis selon le service sélectionné
  const fetchDeliveryQuoteForService = async (service: DeliveryService, targetAddress: string) => {
    if (!service) return;
    
    if (service === "signature") {
      setDeliveryQuote({ 
        fee: deliveryFees.signature.fee, 
        id: "signature_delivery", 
        service: "signature" 
      });
      setDeliveryError(null);
      return;
    }

    // Commenté temporairement pour les autres services
    /*
    if (targetAddress.trim().length < 10) return;
    
    setIsEstimating(true);
    setDeliveryError(null);
    
    try {
      const response = await axios.post(`${BASE_API}/delivery/estimate`, { 
        address: targetAddress,
        service: service 
      });
      
      setDeliveryQuote({ 
        fee: response.data.fee, 
        id: response.data.quoteId,
        service: service 
      });
    } catch (err: any) {
      setDeliveryError(`Service ${deliveryFees[service]?.label} non disponible à cette adresse.`);
      setDeliveryQuote(null);
    } finally {
      setIsEstimating(false);
    }
    */
  };

  const handleDeliveryServiceChange = (service: DeliveryService) => {
    setSelectedDeliveryService(service);
    if (service === "signature") {
      setDeliveryQuote({ fee: 5, id: "signature_delivery", service: "signature" });
      setDeliveryError(null);
    } 
    // Commenté temporairement
    /*
    else if (address.trim().length >= 10) {
      fetchDeliveryQuoteForService(service, address);
    } else {
      setDeliveryQuote(null);
    }
    */
  };

  const handleAddressBlur = () => {
    // Commenté temporairement
    /*
    if (selectedDeliveryService && selectedDeliveryService !== "signature" && address.trim().length >= 10) {
      fetchDeliveryQuoteForService(selectedDeliveryService, address);
    }
    */
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

  const amountToPay = getAmountToPay();
  const shouldShowEmailFields = (payNow === true || orderMode === "booking") && amountToPay > 0;

  // ACTION FINALE
  const handleFinalOrder = async () => {
    console.log("=== handleFinalOrder appelé ===");
    setIsSubmitting(true);
    
    const fcmToken = localStorage.getItem('fcm_client_token');
    console.log("🔑 Token FCM récupéré:", fcmToken ? "✅ Oui" : "❌ Non");
    
    let clientId = localStorage.getItem('signature_client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('signature_client_id', clientId);
    }

    const currentAmountToPay = getAmountToPay();
    const needsPayment = currentAmountToPay > 0 && (payNow === true || orderMode === "booking");
    
    const orderData = {
      clientId: clientId,
      fcmToken: fcmToken || null,
      customer: {
        name: customerName || "Client Signature",
        email: customerEmail,
        phone: customerPhone,
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
      amountPaid: currentAmountToPay,
      mode: orderMode,
      status: needsPayment ? "pending_payment" : "pending",
      details: {
        consumeMode: orderMode === "on_site" ? consumeMode : null,
        tableNumber: selectedTable || null,
        guestCount: orderMode === "booking" ? guestCount : null,
        bookingSlot: orderMode === "booking" ? `${bookingDate} ${bookingTime}` : null,
        deliveryTime: orderMode === "delivery" ? deliveryTime : null,
        paymentStatus: needsPayment ? "pending_stripe" : "pending_at_counter",
        deliveryService: deliveryQuote?.service || null,
        deliveryQuoteId: deliveryQuote?.id || null,
        deliveryFee: deliveryQuote?.fee || 0,
        customerEmail: customerEmail,
        customerPhone: customerPhone
      }
    };

    try {
      console.log("=== DÉBUT CRÉATION COMMANDE ===");
      console.log("📦 OrderData envoyé:", JSON.stringify(orderData, null, 2));
      
      const response = await axios.post(`${BASE_API}/orders`, orderData);
      console.log("📥 Réponse brute de l'API /orders:", response);
      console.log("📥 Response.data:", response.data);
      console.log("📥 Response.data.success:", response.data.success);
      console.log("📥 Response.data.data:", response.data.data);
      
      if (response.data.success) {
        const orderId = response.data.order?._id || 
                    response.data.order?.id || 
                    response.data.data?._id ||
                    response.data.orderId;
        
        console.log("🔑 OrderId extrait:", orderId);
        
        if (!orderId) {
          console.error("❌ CRITIQUE: Impossible de récupérer l'ID de la commande !");
          alert("Erreur: L'ID de la commande n'a pas été retourné");
          setIsSubmitting(false);
          return;
        }
        
        if (!needsPayment) {
          console.log("💰 Paiement à la caisse - Notification immédiate");
          
          try {
            const notifResponse = await axios.post(`${BASE_API}/notifications/new-order`, {
              orderId: orderId,
              customerName: customerName || "Client Signature",
              total: totalPrice.toFixed(2),
              itemsCount: cart.length,
              mode: orderMode === "delivery" ? "Livraison" : orderMode === "booking" ? "Réservation" : "Sur place",
              tableNumber: selectedTable || null,
              paymentMethod: "Caisse"
            });
            console.log("✅ Réponse notification:", notifResponse.data);
          } catch (notifError: any) {
            console.error("❌ Erreur envoi notification:", notifError.message);
          }
          
          console.log(`🔄 Redirection vers: /order-success?orderId=${orderId}`);
          window.location.href = `/order-success?orderId=${orderId}`;
        }
        
        else {
          console.log("💳 Paiement Stripe - Attente du paiement...");
          
          const stripeItems = cart.map((item: any) => {
            const unitPrice = parsePrice(item.price);
            const supplementsTotal = item.supplements?.reduce((sum: number, supp: any) => {
              return sum + parsePrice(supp.price);
            }, 0) || 0;
            const totalPrice = (unitPrice + supplementsTotal) * (item.quantity || 1);
            
            return {
              name: item.name,
              price: totalPrice,
              quantity: 1,
              chosenAccompaniment: item.chosenAccompaniment || "Aucun"
            };
          });
          
          const paymentResponse = await axios.post(`${BASE_API}/payments/create-checkout-session`, {
            items: stripeItems,
            orderId: orderId
          });
          
          if (paymentResponse.data.url) {
            window.location.href = paymentResponse.data.url;
          } else {
            console.error("❌ Pas d'URL dans la réponse Stripe");
            alert("Erreur lors de la redirection Stripe");
            setIsSubmitting(false);
          }
        }
      } else {
        console.error("❌ La commande n'a pas été créée (success: false)");
        alert(`Erreur: ${response.data.message || "Commande non créée"}`);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("❌ EXCEPTION dans handleFinalOrder:", error);
      alert(`Erreur : ${error.response?.data?.message || error.message || "Veuillez vérifier vos informations"}`);
      setIsSubmitting(false);
    } 
  };

  // Validation du formulaire
  const isOrderDisabled = () => {
    if (!isAgreed) return true;
    if (isSubmitting) return true;
    
    if (orderMode === 'delivery') {
      if (!selectedDeliveryService) return true;
      if (!deliveryQuote) return true;
      if (!customerName || customerName.trim() === "") return true;
      if (!customerPhone || customerPhone.trim() === "") return true;
      if (!address || address.trim().length < 10) return true;
    }
    
    if (orderMode === 'booking') {
      if (!customerName) return true;
      if (!bookingDate || !bookingTime) return true;
    }
    
    if (orderMode === 'on_site') {
      if (consumeMode === 'dine_in' && !selectedTable) return true;
      if (payNow === true && (!customerEmail || !customerEmail.includes('@'))) return true;
    }
    
    if (shouldShowEmailFields && (!customerEmail || !customerEmail.includes('@'))) return true;
    
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
                      
                      {payNow === true && amountToPay > 0 && (
                        <div className="input-group full">
                          <label>Email * (pour le reçu)</label>
                          <input type="email" placeholder="votre@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
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
                      
                      {shouldShowEmailFields && (
                        <div className="input-group full">
                          <label>Email *</label>
                          <input type="email" placeholder="votre@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                        </div>
                      )}
                      
                      <div className="input-group full">
                        <label><Bike size={14}/> Adresse de livraison *</label>
                        <input 
                          type="text" 
                          placeholder="Adresse précise..." 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)} 
                          onBlur={handleAddressBlur}
                        />
                      </div>

                      <div className="delivery-services-section">
                        <label className="section-label">Choisissez votre service de livraison :</label>
                        <div className="delivery-services-grid">
                          {/* Commenté temporairement
                          <button
                            type="button"
                            className={`delivery-service-btn ${selectedDeliveryService === "uber" ? "active" : ""}`}
                            onClick={() => handleDeliveryServiceChange("uber")}
                          >
                            <span className="service-icon">🚲</span>
                            <span className="service-name">Uber Eats</span>
                            <span className="service-price">Prix selon course</span>
                          </button>

                          <button
                            type="button"
                            className={`delivery-service-btn ${selectedDeliveryService === "deliveroo" ? "active" : ""}`}
                            onClick={() => handleDeliveryServiceChange("deliveroo")}
                          >
                            <span className="service-icon">🛵</span>
                            <span className="service-name">Deliveroo</span>
                            <span className="service-price">Prix selon course</span>
                          </button>

                          <button
                            type="button"
                            className={`delivery-service-btn ${selectedDeliveryService === "justeat" ? "active" : ""}`}
                            onClick={() => handleDeliveryServiceChange("justeat")}
                          >
                            <span className="service-icon">🍔</span>
                            <span className="service-name">Just Eat</span>
                            <span className="service-price">Prix selon course</span>
                          </button>
                          */}

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

                      {isEstimating && (
                        <small className="gold-text">Calcul des frais de livraison...</small>
                      )}
                      
                      {deliveryError && (
                        <small className="error-text">{deliveryError}</small>
                      )}
                      
                      {deliveryQuote && !deliveryError && (
                        <div className="delivery-quote-success">
                          <Sparkles size={16} />
                          <span>
                            {deliveryQuote.service === "signature" 
                              ? "✨ Livraison Signature : 5.00€ ajoutés à votre commande"
                              : `✓ Livraison via ${deliveryFees[deliveryQuote.service as keyof typeof deliveryFees]?.label} : +${deliveryQuote.fee.toFixed(2)}€`
                            }
                          </span>
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
                        <label>Nom de la réservation *</label>
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      
                      <div className="input-group full">
                        <label>Email *</label>
                        <input type="email" placeholder="votre@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                      </div>
                      <div className="input-group full">
                        <label>Téléphone</label>
                        <input type="tel" placeholder="Votre numéro" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
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
                  <span>Frais de livraison ({deliveryFees[deliveryQuote.service as keyof typeof deliveryFees]?.label || "Livraison"})</span>
                  <span className="gold-text">+{deliveryQuote.fee.toFixed(2)}€</span>
                </div>
              )}

              <div className="summary-line total">
                <span>{orderMode === "booking" ? "Acompte (50%) :" : "À payer :"}</span>
                <span>{amountToPay.toFixed(2)}€</span>
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