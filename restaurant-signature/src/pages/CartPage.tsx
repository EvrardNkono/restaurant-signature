import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import DishCard from '../components/DishCard';
import backgroundImg from '../assets/ton-image.jpeg';
import './CartPage.css';

const CartPage = () => {
  const { items } = useCart();
  const navigate = useNavigate();

  const total = items.reduce((acc, item) => {
    const { dish, quantity } = item;

    if (dish.promoPack && quantity >= dish.promoPack.quantity) {
      const packSize = dish.promoPack.quantity;
      const packPrice = dish.promoPack.price;

      const fullPacks = Math.floor(quantity / packSize);
      const remainingItems = quantity % packSize;

      const promoTotal = fullPacks * packPrice;
      const regularTotal = remainingItems * dish.price;

      return acc + promoTotal + regularTotal;
    } else {
      return acc + quantity * dish.price;
    }
  }, 0);

  return (
    <div className="cart-page">
      {/* En-tête avec image de fond */}
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
            {items.map(({ dish, quantity, selectedComplement, selectedSauce, isTakeaway }) => {
              const { promoPack, price } = dish;

              let unitPrice = price;

              if (promoPack && quantity >= promoPack.quantity) {
                const packSize = promoPack.quantity;
                const packPrice = promoPack.price;

                const fullPacks = Math.floor(quantity / packSize);
                const remainingItems = quantity % packSize;

                const totalPrice = (fullPacks * packPrice) + (remainingItems * price);
                unitPrice = totalPrice / quantity;
              }

              return (
                <DishCard
                  key={`${dish.id}-${selectedComplement || 'noComp'}-${selectedSauce || 'noSauce'}-${isTakeaway ? 'takeaway' : 'surplace'}`}
                  dish={{
                    ...dish,
                    price: unitPrice,
                    selectedComplement,
                    selectedSauce,
                    isTakeaway,
                  }}
                  quantity={quantity}
                  showQuantityControls={true}
                />
              );
            })}
          </div>

          <div className="cart-total">
            <h3>Total : {total.toFixed(2)} €</h3>
            <button
              className="order-btn"
              onClick={() => navigate('/commande')}
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
