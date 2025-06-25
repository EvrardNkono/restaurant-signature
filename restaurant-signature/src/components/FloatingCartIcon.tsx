import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';  // <-- import

const FloatingCartIcon = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();  // <-- hook navigate

  return (
    <div
      style={{
        position: 'fixed',
        top: '110px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#7C3AED',
        color: 'white',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 0 8px rgba(124, 58, 237, 0.7)',
        userSelect: 'none',
        zIndex: 9999,
      }}
      title="Voir le panier"
      onClick={() => navigate('/panier')}  // <-- navigation réelle ici
    >
      <FontAwesomeIcon icon={faShoppingCart} />
      {totalItems > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            backgroundColor: '#F87171',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            color: 'white',
            pointerEvents: 'none',
            boxShadow: '0 0 3px rgba(0,0,0,0.3)',
          }}
        >
          {totalItems}
        </span>
      )}
    </div>
  );
};

export default FloatingCartIcon;
