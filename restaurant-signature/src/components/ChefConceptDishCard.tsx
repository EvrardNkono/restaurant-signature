import React, { useState } from 'react';
import type { Dish } from '../data/types';
import './ChefConceptDishCard.css';

interface Props {
  dish: Dish;
}

const accompaniments = [
  'Riz blanc', 'Riz sauté', 'Frites de Patate douce',
  'Atieke', 'Frites de plantain', 'Chikwangue', 'Bâton de manioc'
];

const ChefConceptDishCard: React.FC<Props> = ({ dish }) => {
  const [selectedAccompaniment, setSelectedAccompaniment] = useState('');
  const [withDrink, setWithDrink] = useState(false);

  const basePrice = 8.0;
  const price = withDrink ? 8.9 : basePrice;

  return (
    <div className="chef-card">
      <img src={dish.image} alt={dish.name} className="dish-image" />
      <h3>{dish.name}</h3>
      <p>{dish.description}</p>

      <div className="options">
        <label>Accompagnement :</label>
        <select
          value={selectedAccompaniment}
          onChange={(e) => setSelectedAccompaniment(e.target.value)}
          required
        >
          <option value="">-- Choisir --</option>
          {accompaniments.map((acc) => (
            <option key={acc} value={acc}>{acc}</option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={withDrink}
            onChange={(e) => setWithDrink(e.target.checked)}
          />
          Ajouter une boisson (+0,90 €)
        </label>

        <p className="price">Prix total : {price.toFixed(2)} €</p>

        <button className="add-to-cart">Ajouter au panier</button>
      </div>
    </div>
  );
};

export default ChefConceptDishCard;
