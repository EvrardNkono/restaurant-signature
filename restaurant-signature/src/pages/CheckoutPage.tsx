import React, { useState } from 'react';
import menuData from '../data/menuData';
import DishCard from '../components/DishCard';
import bannerImage from '../assets/Week-end-banner.jpg';
import './ChefConcept.css';

const accompaniments = [
  'Riz blanc',
  'Riz sauté',
  'Frites de Patate douce',
  'Atieke',
  'Frites de plantain',
  'Chikwangue',
  'Bâton de manioc'
];

const ChefConcept: React.FC = () => {
  const chefDishes = menuData.filter(dish => dish.category === "Concept du Chef");

  const [choices, setChoices] = useState<{ [key: number]: { accompaniment: string, withDrink: boolean } }>({});

  const handleChange = (dishId: number, field: 'accompaniment' | 'withDrink', value: string | boolean) => {
    setChoices(prev => ({
      ...prev,
      [dishId]: {
        ...prev[dishId],
        [field]: value
      }
    }));
  };

  return (
    <div className="chef-concept-container">
      <div className="chef-banner">
        <img src={bannerImage} alt="Bannière Concept du Chef" className="banner-image" />
        <div className="banner-overlay" />
        <div className="banner-content">
          <h1>✨ Concept du Chef ✨</h1>
          <p className='surprise'>Laissez-vous surprendre par des créations uniques, pensées pour éveiller vos papilles !</p>
        </div>
      </div>

      <div className="dishes-section">
        <div className="dishes-grid">
          {chefDishes.length === 0 && <p>Le chef mijote encore... Revenez bientôt !</p>}
          {chefDishes.map((dish) => {
            const withDrink = choices[dish.id]?.withDrink || false;
            const price = dish.price + (withDrink ? 0.9 : 0);
            return (
              <div key={dish.id} className="dish-card-with-options">
                <DishCard
                  dish={dish}
                  showQuantityControls={true}
                  isChefConcept={true}
                  medalColor="#DAA520"
                />

                <div className="extra-options">
                  <label className="extra-label">
                    🥗 Accompagnement :
                    <select
                      value={choices[dish.id]?.accompaniment || ''}
                      onChange={(e) => handleChange(dish.id, 'accompaniment', e.target.value)}
                    >
                      <option value="">-- Sélectionner --</option>
                      {accompaniments.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={withDrink}
                      onChange={(e) => handleChange(dish.id, 'withDrink', e.target.checked)}
                    />
                    Ajouter une boisson (+0,90 €)
                  </label>

                  <p className="price-display">Prix total : <strong>{price.toFixed(2)} €</strong></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChefConcept;
