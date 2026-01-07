import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./cart.css";

export default function Cart() {
  const { cart, removeFromCart } = useCart();
  
  // États de logique métier
  const [orderMode, setOrderMode] = useState<"on_site" | "booking" | "delivery">("on_site");
  const [consumeMode, setConsumeMode] = useState<"dine_in" | "take_away">("dine_in"); // Nouveau : sur place ou emporter
  const [payNow, setPayNow] = useState<boolean>(true);
  const [isAgreed, setIsAgreed] = useState(false);
  
  // États pour les infos client et livraison
  const [customerName, setCustomerName] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [minTime, setMinTime] = useState("");

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

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = parseFloat(item.price.toString().replace(/[^\d.]/g, ""));
      return acc + price;
    }, 0);
  };

  const totalPrice = calculateTotal();
  const depositAmount = totalPrice / 2;

  const getAmountToPay = () => {
    if (orderMode === "on_site") return payNow ? totalPrice : 0;
    if (orderMode === "booking") return depositAmount;
    if (orderMode === "delivery") return totalPrice;
    return totalPrice;
  };

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
              {/* TABLEAU DES ARTICLES */}
              <div className="cart-table-header">
                <span>Produit</span>
                <span>Prix</span>
                <span className="text-center">Action</span>
              </div>
              
              <div className="cart-items-list">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="cart-item">
                    <div className="item-info">
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <span className="item-category">Signature</span>
                      </div>
                    </div>
                    <span className="item-price">{item.price}€</span>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>Supprimer</button>
                  </div>
                ))}
              </div>

              {/* OPTIONS DE COMMANDE */}
              <div className="order-options-box">
                <h3 className="options-title">Comment souhaitez-vous commander ?</h3>
                
                <div className="selection-grid">
                  <button className={`select-btn ${orderMode === "on_site" ? "active" : ""}`} onClick={() => setOrderMode("on_site")}>📍 Sur place</button>
                  <button className={`select-btn ${orderMode === "booking" ? "active" : ""}`} onClick={() => setOrderMode("booking")}>📅 Réserver</button>
                  <button className={`select-btn ${orderMode === "delivery" ? "active" : ""}`} onClick={() => setOrderMode("delivery")}>🚲 Livraison</button>
                </div>

                <div className="dynamic-form-container">
                  {/* CAS : SUR PLACE (Choix Emporter / Sur Place + Paiement) */}
                  {orderMode === "on_site" && (
                    <div className="form-fade-in">
                      <p className="form-instruction">Type de consommation :</p>
                      <div className="selection-grid small" style={{marginBottom: '20px'}}>
                        <button className={`select-btn ${consumeMode === "dine_in" ? "active" : ""}`} onClick={() => setConsumeMode("dine_in")}>🍽️ À consommer sur place</button>
                        <button className={`select-btn ${consumeMode === "take_away" ? "active" : ""}`} onClick={() => setConsumeMode("take_away")}>🥡 À emporter</button>
                      </div>

                      <p className="form-instruction">Souhaitez-vous régler maintenant ?</p>
                      <div className="selection-grid small">
                        <button className={`select-btn ${payNow ? "active" : ""}`} onClick={() => setPayNow(true)}>💳 En ligne</button>
                        <button className={`select-btn ${!payNow ? "active" : ""}`} onClick={() => setPayNow(false)}>💵 À la caisse</button>
                      </div>
                    </div>
                  )}

                  {/* IDENTITÉ (Commun Livraison et Réservation) */}
                  {(orderMode === "delivery" || orderMode === "booking") && (
                    <div className="form-fade-in" style={{marginBottom: '20px'}}>
                       <div className="input-group full">
                        <label>Nom complet</label>
                        <input 
                          type="text" 
                          placeholder="Entrez votre nom" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* CAS : RÉSERVATION */}
                  {orderMode === "booking" && (
                    <div className="form-fade-in">
                      <p className="form-instruction">Détails de votre venue (Acompte de 50% requis) :</p>
                      <div className="form-row">
                        <div className="input-group">
                          <label>Date</label>
                          <input type="date" min={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div className="input-group">
                          <label>Heure</label>
                          <input type="time" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAS : LIVRAISON */}
                  {orderMode === "delivery" && (
                    <div className="form-fade-in">
                      <div className="input-group full">
                        <label>Adresse de livraison complète</label>
                        <input type="text" placeholder="Rue, étage, code postal..." />
                      </div>
                      <div className="input-group full">
                        <label>Heure de livraison (Minimum 1h30 après commande)</label>
                        <input 
                          type="time" 
                          min={minTime} 
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                        />
                        <small style={{color: '#D4AF37'}}>Heure minimale : {minTime}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RÉSUMÉ DE COMMANDE */}
            <div className="cart-summary">
              <h3 className="summary-title">Récapitulatif</h3>
              
              <div className="summary-line">
                <span>Mode</span>
                <span style={{color: '#D4AF37'}}>
                  {orderMode === "on_site" && (consumeMode === "dine_in" ? "Sur place" : "À emporter")}
                  {orderMode === "booking" && "Réservation"}
                  {orderMode === "delivery" && "Livraison"}
                </span>
              </div>

              {customerName && (
                <div className="summary-line">
                  <span>Client</span>
                  <span style={{color: '#D4AF37'}}>{customerName}</span>
                </div>
              )}

              <div className="summary-line">
                <span>Total Commande</span>
                <span>{totalPrice.toFixed(2)}€</span>
              </div>

              {orderMode === "booking" && (
                <div className="summary-line deposit-info">
                  <span>Acompte à payer (50%)</span>
                  <span>{depositAmount.toFixed(2)}€</span>
                </div>
              )}

              <div className="summary-line total">
                <span>Total à payer ici :</span>
                <span>{getAmountToPay().toFixed(2)}€</span>
              </div>

              <div className="legal-notice">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                  Je confirme que cette commande est <strong>non-remboursable</strong>.
                </label>
              </div>

              <button className={`checkout-btn ${!isAgreed ? "disabled" : ""}`} disabled={!isAgreed}>
                {getAmountToPay() === 0 ? "Confirmer ma commande" : "Procéder au paiement"}
              </button>
              <p className="footer-warning">* Aucun remboursement ne sera effectué après validation.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}