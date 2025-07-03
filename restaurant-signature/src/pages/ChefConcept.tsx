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

const saucesParJour: { [key: number]: string[] } = {
  1: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry','Sauce crème'],
  2: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry','Sauce crème'],
  3: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry','Sauce crème'],
  4: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry','Sauce crème'],
  5: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry','Sauce crème'],
  6: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry','Sauce crème'],
  0: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry','Sauce crème']
};

const jourActuel = new Date().getDay();
const saucesDuJour = saucesParJour[jourActuel] || [];

const ChefConcept: React.FC = () => {
  const chefDishes = menuData.filter(dish => dish.category === "Concept du Chef");
  const boissons = menuData.filter(dish => dish.category === "Boissons");

  const boissonsParSousCategorie = boissons.reduce((acc, boisson) => {
    const key = boisson.subCategory || 'Autres';
    if (!acc[key]) acc[key] = [];
    acc[key].push(boisson);
    return acc;
  }, {} as Record<string, typeof boissons>);

  const [choices, setChoices] = useState<{
    [key: number]: {
      sauce: string;
      accompaniment: string;
      selectedDrinkId: number | null;
    };
  }>({});

  const handleChange = (
    dishId: number,
    field: 'sauce' | 'accompaniment' | 'selectedDrinkId',
    value: string | number | null
  ) => {
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
          <p className="today-sauce">🍲 Sauces du jour : {saucesDuJour.join(' & ')}</p>
        </div>
      </div>

      <div className="dishes-section">
        <div className="dishes-grid">
          {chefDishes.length === 0 && <p>Le chef mijote encore... Revenez bientôt !</p>}
          {chefDishes.map((dish) => {
            const selected = choices[dish.id] || {
              sauce: '',
              accompaniment: '',
              selectedDrinkId: null
            };

            const selectedDrink = boissons.find(b => b.id === selected.selectedDrinkId);
            const finalPrice = 8.0 + (selectedDrink ? 0.9 : 0.0);

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
                      {saucesDuJour.map((sauce) => (
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

                  <label className="extra-label">
                    🥤 Boisson :
                    <select
                      value={selected.selectedDrinkId ?? ''}
                      onChange={(e) => handleChange(dish.id, 'selectedDrinkId', e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Aucune boisson --</option>
                      {Object.entries(boissonsParSousCategorie).map(([subCat, boissons]) => (
                        <optgroup key={subCat} label={subCat.charAt(0).toUpperCase() + subCat.slice(1)}>
                          {boissons.map((boisson) => (
                            <option key={boisson.id} value={boisson.id}>
                              {boisson.name} (+0,90 €)
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
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