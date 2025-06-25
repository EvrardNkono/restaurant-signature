import { useCart } from '../context/CartContext';
import DishCard from '../components/DishCard'; // Import du composant DishCard
import backgroundImg from '../assets/ton-image.jpeg'; // ajuste le chemin vers ton image
import './CartPage.css';

const CartPage = () => {
  const { items } = useCart();

  const total = items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  return (
    <div className="cart-page">
      {/* Header avec image de fond */}
      <div
        style={{
          width: '100%',
          height: '100px',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: '700',
          textShadow: '0 2px 6px rgba(0,0,0,0.7)',
          userSelect: 'none',
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.3)',
          marginBottom: '24px',
        }}
      >
        🛒 Votre Panier
      </div>

      {items.length === 0 ? (
        <p className="empty-cart-message">Votre panier est vide pour le moment.</p>

      ) : (
        <>
          <div className="cart-items">
            {items.map(({ dish, quantity }) => (
              <DishCard
                key={dish.id}
                dish={dish}
                quantity={quantity}
                showQuantityControls={true} // active l'affichage quantité + boutons dans DishCard
              />
            ))}
          </div>

          <div className="cart-total">
            <h3>Total : {total.toFixed(2)} €</h3>
            <button
              className="order-btn"
              onClick={() => alert("Fonction de commande à venir...")}
            >
              Passer la commande
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
