import React, { useState } from 'react';
import type { Dish } from '../data/types';
import './DishCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

interface DishCardProps {
  dish: Dish;
}

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="dish-card">
      {/* Bande violette avec bulle de prix */}
      <div className="dish-top-bar">
        <div className="dish-price-bubble">{dish.price}</div>
      </div>

      {/* Image + Overlay */}
      <div className={`dish-image-wrapper ${showDetails ? 'show-details' : ''}`}>
        <img src={dish.image} alt={dish.name} className="dish-image" />
        <div className="dish-details-overlay">
          <p>{dish.details || "Pas de détails disponibles."}</p>
        </div>
      </div>

      {/* Infos */}
      <div className="dish-info">
        <h3 className="dish-name">{dish.name}</h3>
        <p className="dish-description">{dish.description}</p>

        <div className="dish-buttons-row">
          <button className="dish-button">
            <FontAwesomeIcon icon={faShoppingCart} className="button-icon" />
            Commander
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

export default DishCard;
