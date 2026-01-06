import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./cart.css";

export default function Cart() {
  const { cart, removeFromCart } = useCart();

  // Calcul du prix total (on transforme "38€" en nombre 38)
  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = parseInt(item.price.replace("€", ""));
      return acc + price;
    }, 0);
  };

  const totalPrice = calculateTotal();

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
            <div className="cart-table-header">
              <span>Produit</span>
              <span>Prix</span>
              <span className="text-center">Action</span>
            </div>
            
            <div className="cart-items-list">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cart-item">
                  <div className="item-info">
                    {/* On peut ajouter une image par défaut si elle n'est pas dans le context */}
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <span className="item-category">Signature</span>
                    </div>
                  </div>
                  <span className="item-price">{item.price}</span>
                  
                  <div className="quantity-control">
                    <button 
                      className="cart-remove-btn" 
                      onClick={() => removeFromCart(item.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-line">
                <span>Articles ({cart.length})</span>
                <span>{totalPrice}€</span>
              </div>
              <div className="summary-line total">
                <span>Total à régler</span>
                <span>{totalPrice}€</span>
              </div>
              <button className="checkout-btn">Procéder au Paiement</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}