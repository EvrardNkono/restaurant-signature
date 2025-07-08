import React, { useState } from 'react';
import Select from 'react-select';
import menuData from '../data/menuData';
import DishCard from '../components/DishCard';
import bannerImage from '../assets/Chef.png';
import './ChefConcept.css';

const accompaniments = ['Riz blanc', 'Riz cantonais'];

const saucesParJour: { [key: number]: string[] } = {
  0: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry', 'Sauce crème'],
  1: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry', 'Sauce crème'],
  2: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry', 'Sauce crème'],
  3: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry', 'Sauce crème'],
  4: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry', 'Sauce crème'],
  5: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry', 'Sauce crème'],
  6: ['Sauce mafe', 'Sauce tomate', 'Sauce au curry', 'Sauce crème'],
};

const jourActuel = new Date().getDay();
const saucesDuJour = saucesParJour[jourActuel] || [];

const ChefConcept: React.FC = () => {
  const chefDishes = menuData.filter(dish => dish.category === "Concept du Chef");
  const boissons = menuData.filter(
    dish => dish.category === "Boissons" && dish.subCategory?.toLowerCase() === "sodas"
  );

  const [choices, setChoices] = useState<{
    [key: number]: {
      sauce: string;
      accompaniment: string;
      selectedDrinkId: number | null;
      selectedSupplements: string[];
    };
  }>({});

  const handleChange = (
    dishId: number,
    field: 'sauce' | 'accompaniment' | 'selectedDrinkId' | 'selectedSupplements',
    value: string | number | null | string[]
  ) => {
    setChoices(prev => ({
      ...prev,
      [dishId]: {
        ...prev[dishId],
        [field]: value,
      },
    }));
  };

  const generateDrinkOptions = () => {
    return boissons.map(boisson => ({
      value: boisson.id,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={boisson.image}
            alt={boisson.name}
            style={{ width: 24, height: 24, borderRadius: '50%' }}
          />
          <span>{boisson.name} (+0,90 €)</span>
        </div>
      )
    }));
  };

  const generateSupplementOptions = (dishName: string) => {
  const options = [dishName, ...accompaniments]; // sauces retirées ici
  return options.map(item => ({
    value: item,
    label: `${item} (+3,50 €)`
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
              selectedDrinkId: null,
              selectedSupplements: [],
            };

            const selectedDrink = boissons.find(b => b.id === selected.selectedDrinkId);
            const supplementCount = selected.selectedSupplements?.length || 0;
            const finalPrice = 8.0 + (selectedDrink ? 0.9 : 0.0) + supplementCount * 3.5;

            return (
              <div key={dish.id} className="dish-card-with-options" style={{ position: 'relative', overflow: 'visible', zIndex: 1 }}>
                <DishCard
                  dish={{ ...dish, price: finalPrice }}
                  showQuantityControls={true}
                  isChefConcept={true}
                  medalColor="#DAA520"
                />

                <div className="extra-options" style={{ position: 'relative', overflow: 'visible', zIndex: 1 }}>
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
                    <Select
                      options={generateDrinkOptions()}
                      value={generateDrinkOptions().find(opt => opt.value === selected.selectedDrinkId) || null}
                      onChange={(option) => handleChange(dish.id, 'selectedDrinkId', option ? option.value : null)}
                      isClearable
                      placeholder="-- Selectionner --"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  </label>

                  <label className="extra-label">
                    🧂 Suppléments :
                    <Select
                      options={generateSupplementOptions(dish.name)}
                      value={(selected.selectedSupplements || []).map(sup => ({
                        value: sup,
                        label: `${sup} (+3,50 €)`
                      }))}
                      onChange={(options) =>
                        handleChange(dish.id, 'selectedSupplements', options.map(opt => opt.value))
                      }
                      isMulti
                      placeholder="-- Ajouter des suppléments --"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, zIndex: 9999 }),
                      }}
                    />
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
