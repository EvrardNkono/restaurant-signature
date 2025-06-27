import React, { useState } from 'react';
import type { Dish } from '../data/types';
import './DishCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClone, 
  faShoppingCart, 
  faMinusCircle, 
  faAward, 
  faStar   // Voilà l’étoile qu’il nous faut !
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';

interface DishCardProps {
  dish: Dish;
  quantity?: number;
  showQuantityControls?: boolean;
  isSpecialWeekend?: boolean;
  isChefConcept?: boolean;
  medalColor?: string;
}

const DishCard: React.FC<DishCardProps> = ({
  dish,
  quantity = 0,
  showQuantityControls = false,
  isSpecialWeekend = false,
  isChefConcept = false,
  medalColor = '#DAA520'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { addToCart, removeFromCart } = useCart();

  const cardClassNames = [
    'dish-card',
    isSpecialWeekend && 'dish-card-special',
    isChefConcept && 'dish-card-chef-concept'
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClassNames}>
      <div className="dish-top-bar">
        <div className="dish-price-bubble">
          {isChefConcept ? (
            <>
              <span className="chef-medal-circle"></span>
              <FontAwesomeIcon
                icon={faAward}
                className="chef-medal-icon"
                title="Médaille Concept Chef"
                style={{ color: medalColor }}
              />
              <span className="chef-price-text">{dish.price}€</span>
            </>
          ) : isSpecialWeekend ? (
            <>
              <FontAwesomeIcon
                icon={faStar}  // icône étoile verte pour le weekend
                className="special-weekend-icon"
                title="Spécial Weekend"
                style={{ color: '#1f9d55', fontSize: '2.5rem' }}
              />
              <span className="special-price-text">{dish.price}€</span>
            </>
          ) : (
            <span>{dish.price}€</span>
          )}
        </div>
      </div>

      <div className={`dish-image-wrapper ${showDetails ? 'show-details' : ''}`}>
        <img src={dish.image} alt={dish.name} className="dish-image" />
        <div className="dish-details-overlay">
          <p>{dish.details || "Pas de détails disponibles."}</p>
        </div>
      </div>

      <div className="dish-info">
        <h3 className="dish-name">{dish.name}</h3>
        <p className="dish-description">{dish.description}</p>

        {showQuantityControls && quantity > 0 && (
          <p className="dish-quantity">Quantité dans le panier : {quantity}</p>
        )}

        <div className="dish-buttons-row">
          <button className="dish-button" onClick={() => addToCart(dish)}>
            <FontAwesomeIcon icon={faShoppingCart} className="button-icon" />
            Ajouter
          </button>

          <button className="dish-button remove-button" onClick={() => removeFromCart(dish)}>
            <FontAwesomeIcon icon={faMinusCircle} className="button-icon" />
            Enlever
          </button>

          <button className="dish-button details-button" onClick={() => setShowDetails(prev => !prev)}>
            <FontAwesomeIcon icon={faClone} className="button-icon" />
            {showDetails ? "Cacher" : "Détails"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
