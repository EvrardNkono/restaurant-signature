import React, { useState } from 'react';
import type { Dish } from '../data/types';
import './DishCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClone, 
  faShoppingCart, 
  faMinusCircle, 
  faAward, 
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';

export interface DishCardProps {
  dish: Dish & {
    complements?: string[];
    sauces?: string[];
    selectedComplement?: string;
    selectedSauce?: string;
    isTakeaway?: boolean;
  };
  quantity?: number;
  showQuantityControls?: boolean;
  isSpecialWeekend?: boolean;
  isChefConcept?: boolean;
  medalColor?: string;
}

const formatPrice = (price: number) =>
  price.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const DishCard: React.FC<DishCardProps> = ({
  dish,
  quantity = 0,
  showQuantityControls = false,
  isSpecialWeekend = false,
  isChefConcept = false,
  medalColor = '#7B3FBF'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedComplement, setSelectedComplement] = useState<string>('');
  const [selectedSauce, setSelectedSauce] = useState<string>('');
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [showFlyImage, setShowFlyImage] = useState(false);

  const { addToCart, removeFromCart } = useCart();

  const cardClassNames = [
    'dish-card',
    isSpecialWeekend && 'dish-card-special',
    isChefConcept && 'dish-card-chef-concept'
  ].filter(Boolean).join(' ');

  const displayedPrice = isTakeaway && dish.takeawayPrice !== undefined
    ? dish.takeawayPrice
    : dish.price;

  const bubbleColor = isTakeaway ? '#00BFFF' : '#7B3FBF';

  const handleAddToCart = () => {
  const needsComplement = dish.category === "Plats" && (dish.complements ?? []).length > 0;
  const needsSauce = dish.category === "Plats" && (dish.sauces ?? []).length > 0;

  const missingComplement = needsComplement && !selectedComplement;
  const missingSauce = needsSauce && !selectedSauce;

  if (missingComplement || missingSauce) {
    const messageParts = [];
    if (missingComplement) messageParts.push("un accompagnement");
    if (missingSauce) messageParts.push("une sauce");

    alert(`Veuillez sélectionner ${messageParts.join(" et ")} avant d’ajouter ce plat au panier.`);
    return;
  }

  // Animation
  setShowFlyImage(true);
  setTimeout(() => setShowFlyImage(false), 1000); // durée de l'animation

  // Ajout au panier
  addToCart({ ...dish, selectedComplement, selectedSauce, isTakeaway, price: displayedPrice });
};


  return (
    <div className={cardClassNames}>
      <div className="dish-top-bar">
        <div 
          className="dish-price-bubble"
          style={{ backgroundColor: bubbleColor, color: 'white', fontWeight: '700' }}
        >
          {isChefConcept ? (
            <>
              <span className="chef-medal-circle"></span>
              <FontAwesomeIcon
                icon={faAward}
                className="chef-medal-icon"
                title="Médaille Concept Chef"
                style={{ color: medalColor }}
              />
              <span className="chef-price-text" style={{ color: medalColor }}>
                {formatPrice(displayedPrice)}
              </span>
            </>
          ) : isSpecialWeekend ? (
            <>
              <FontAwesomeIcon
                icon={faStar}
                className="special-weekend-icon"
                title="Spécial Weekend"
                style={{ color: '#1f9d55', fontSize: '2.5rem' }}
              />
              <span className="special-price-text">{formatPrice(displayedPrice)}</span>
            </>
          ) : (
            <span>{formatPrice(displayedPrice)}</span>
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
        <h3 className="dish-name" style={{ color: '#7B3FBF' }}>{dish.name}</h3>
        <p className="dish-description">{dish.description}</p>

        {dish.takeawayPrice !== undefined && (
          <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#5a2d91', marginRight: '1rem' }}>
              <input
                type="radio"
                name={`takeaway-${dish.id}`}
                checked={!isTakeaway}
                onChange={() => setIsTakeaway(false)}
                style={{ marginRight: '0.3rem' }}
              />
              Sur place
            </label>
            <label style={{ fontWeight: '600', color: '#5a2d91' }}>
              <input
                type="radio"
                name={`takeaway-${dish.id}`}
                checked={isTakeaway}
                onChange={() => setIsTakeaway(true)}
                style={{ marginRight: '0.3rem' }}
              />
              À emporter
            </label>
          </div>
        )}

        {dish.category === "Plats" && dish.complements && dish.complements.length > 0 && (
          <div className="dish-complements" style={{ marginTop: '1rem' }}>
            <label htmlFor={`complements-select-${dish.id}`} style={{ fontWeight: '600', color: '#5a2d91' }}>
              Choisissez un accompagnement:
            </label>
            <select
              id={`complements-select-${dish.id}`}
              value={selectedComplement}
              onChange={e => setSelectedComplement(e.target.value)}
              style={{
                marginTop: '0.3rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '5px',
                border: '1px solid #7B3FBF',
                color: '#4b2e83',
                fontWeight: '500',
                minWidth: '180px',
                cursor: 'pointer',
                backgroundColor: '#f5f0fa'
              }}
            >
              <option value="" disabled>-- Sélectionnez --</option>
              {dish.complements.map((comp, idx) => (
                <option key={idx} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
        )}
        {dish.category === "Plats" && dish.sauces && dish.sauces.length > 0 && (
          <div
            className="dish-sauces"
            style={{
              marginTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <label
              htmlFor={`sauces-select-${dish.id}`}
              style={{
                fontWeight: '600',
                color: '#5a2d91',
                marginBottom: '4px'
              }}
            >
              Choisissez une sauce :
            </label>
            <select
              id={`sauces-select-${dish.id}`}
              value={selectedSauce}
              onChange={e => setSelectedSauce(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '5px',
                border: '1px solid #7B3FBF',
                color: '#4b2e83',
                fontWeight: '500',
                minWidth: '180px',
                maxWidth: '190px',
                cursor: 'pointer',
                backgroundColor: '#f5f0fa'
              }}
            >
              <option value="" disabled>-- Sélectionnez --</option>
              {dish.sauces.map((sauce, idx) => (
                <option key={idx} value={sauce}>{sauce}</option>
              ))}
            </select>
          </div>
        )}

        {showQuantityControls && quantity > 0 && (
          <p className="dish-quantity">Quantité dans le panier : {quantity}</p>
        )}

        <div className="dish-buttons-row">
          <button 
            className="dish-button" 
            onClick={handleAddToCart}
            style={{
              backgroundColor: '#7B3FBF',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#5a2d91';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#7B3FBF';
            }}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="button-icon" />
            Ajouter
          </button>

          <button
            className="dish-button remove-button"
            onClick={() => removeFromCart({
              ...dish,
              selectedComplement,
              selectedSauce,
              isTakeaway
            })}
          >
            <FontAwesomeIcon icon={faMinusCircle} className="button-icon" />
            Enlever
          </button>

          <button className="dish-button details-button" onClick={() => setShowDetails(prev => !prev)}>
            <FontAwesomeIcon icon={faClone} className="button-icon" />
            {showDetails ? "Cacher" : "Détails"}
          </button>
        </div>
      </div>
      {showFlyImage && (
  <div className="fly-popup">
    <img src={dish.image} alt="Produit ajouté" className="fly-popup-image" />
  </div>
)}

    </div>
  );
};

export default DishCard;
