// components/ChefCard.tsx
import React from 'react';
import './ChefCard.css';

interface ChefCardProps {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  choices: {
    sauce: string;
    accompaniment: string;
    withDrink: boolean;
  };
  sauces: string[];
  accompaniments: string[];
  onChange: (field: 'sauce' | 'accompaniment' | 'withDrink', value: string | boolean) => void;
}

const ChefCard: React.FC<ChefCardProps> = ({
  name,
  image,
  description,
  price,
  choices,
  sauces,
  accompaniments,
  onChange
}) => {
  return (
    <div className="chef-card">
      <img src={image} alt={name} className="chef-card-image" />
      <div className="chef-card-content">
        <h3>{name}</h3>
        <p className="chef-description">{description}</p>

        <div className="chef-options">
          <label>
            Sauce :
            <select value={choices.sauce} onChange={(e) => onChange('sauce', e.target.value)}>
              <option value="">-- Choisissez --</option>
              {sauces.map((sauce) => (
                <option key={sauce} value={sauce}>{sauce}</option>
              ))}
            </select>
          </label>

          <label>
            Accompagnement :
            <select value={choices.accompaniment} onChange={(e) => onChange('accompaniment', e.target.value)}>
              <option value="">-- Choisissez --</option>
              {accompaniments.map((acc) => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={choices.withDrink}
              onChange={(e) => onChange('withDrink', e.target.checked)}
            />
            Ajouter une boisson (+0,90 €)
          </label>
        </div>

        <div className="chef-price">
          Prix total : <strong>{price.toFixed(2)} €</strong>
        </div>
      </div>
    </div>
  );
};

export default ChefCard;
