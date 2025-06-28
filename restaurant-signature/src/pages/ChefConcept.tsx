import React, { useState } from 'react';
import menuData from '../data/menuData';
import DishCard from '../components/DishCard';
import bannerImage from '../assets/Chef.png';
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

const sauces = [
  'Sauce arachide',
  'Sauce tomate',
  'Sauce gombo',
  'Sauce coco-citronnelle'
];

const ChefConcept: React.FC = () => {
  const chefDishes = menuData.filter(dish => dish.category === "Concept du Chef");

  const [choices, setChoices] = useState<{
    [key: number]: {
      sauce: string;
      accompaniment: string;
      withDrink: boolean;
    };
  }>({});

  const handleChange = (dishId: number, field: 'sauce' | 'accompaniment' | 'withDrink', value: string | boolean) => {
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
          <p className="surprise">Laissez-vous surprendre par des créations uniques, pensées pour éveiller vos papilles !</p>
        </div>
      </div>

      <div className="dishes-section">
        <div className="dishes-grid">
          {chefDishes.length === 0 && <p>Le chef mijote encore... Revenez bientôt !</p>}
          {chefDishes.map((dish) => {
            const selected = choices[dish.id] || {
              sauce: '',
              accompaniment: '',
              withDrink: false
            };
            const basePrice = 8.0;
            const finalPrice = selected.withDrink ? basePrice + 0.9 : basePrice;

            return (
              <div key={dish.id} className="dish-card-with-options">
                <DishCard
                  dish={{ ...dish, price: finalPrice }}
                  showQuantityControls={true}
                  isChefConcept={true}
                  medalColor="#DAA520"
                />

                <div className="extra-options">
                  <label className="extra-label">
                    🍲 Sauce :
                    <select
                      value={selected.sauce}
                      onChange={(e) => handleChange(dish.id, 'sauce', e.target.value)}
                    >
                      <option value="">-- Sélectionner --</option>
                      {sauces.map((sauce) => (
                        <option key={sauce} value={sauce}>{sauce}</option>
                      ))}
                    </select>
                  </label>

                  <label className="extra-label">
                    🍚 Accompagnement :
                    <select
                      value={selected.accompaniment}
                      onChange={(e) => handleChange(dish.id, 'accompaniment', e.target.value)}
                    >
                      <option value="">-- Sélectionner --</option>
                      {accompaniments.map((acc) => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selected.withDrink}
                      onChange={(e) => handleChange(dish.id, 'withDrink', e.target.checked)}
                    />
                    Ajouter une boisson (+0,90 €)
                  </label>

                  <p className="price-display">Prix total : <strong>{finalPrice.toFixed(2)} €</strong></p>
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
