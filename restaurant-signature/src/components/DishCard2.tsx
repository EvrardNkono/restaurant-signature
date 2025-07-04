import React, { useState } from 'react';
import type { Dish } from '../data/types';
import './DishCard2.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faShoppingCart, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';

interface DishCard2Props {
  dish: Dish;
  quantity?: number;         // Quantité optionnelle à afficher
  showQuantityControls?: boolean;    // Contrôle affichage quantité, false par défaut
}

const DishCard2: React.FC<DishCard2Props> = ({ dish, quantity = 0, showQuantityControls = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { addToCart, removeFromCart } = useCart();

  return (
    <div className="dish-card">
      <div className="dish-top-bar">
        <div className="dish-price-bubble">{dish.price}€</div>
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
          <button
            className="dish-button"
            onClick={() => addToCart(dish)}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="button-icon" />
            Ajouter
          </button>

          <button
            className="dish-button remove-button"
            onClick={() => removeFromCart(dish)}
          >
            <FontAwesomeIcon icon={faMinusCircle} className="button-icon" />
            Enlever
          </button>

          <button
            className="dish-button details-button"
            onClick={() => setShowDetails(prev => !prev)}
          >
            <FontAwesomeIcon icon={faClone} className="button-icon" />
            {showDetails ? "Cacher" : "Détails"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard2;
