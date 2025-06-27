import React from 'react';

import menuData from '../data/menuData';
import DishCard from '../components/DishCard';
import './ChefConcept.css';

const ChefConcept: React.FC = () => {
  const chefDishes = menuData.filter(dish => dish.category === "Concept du Chef");

  return (
    <div className="chef-concept-container">
  <div className="chef-banner">
    <img
      src="/src/assets/Week-end-banner.jpg"
      alt="Bannière Concept du Chef"
      className="banner-image"
    />
    <div className="banner-overlay" />
    <div className="banner-content">
      <h1>✨ Concept du Chef ✨</h1>
      <p>Laissez-vous surprendre par des créations uniques, pensées pour éveiller vos papilles !</p>
    </div>
  </div>

  {/* Container avec padding max 50px autour */}
  <div className="dishes-section">
    <div className="dishes-grid">
      {chefDishes.length === 0 && <p>Le chef mijote encore... Revenez bientôt !</p>}
      {chefDishes.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          showQuantityControls={true}
          isChefConcept={true}
          medalColor="#DAA520"
        />
      ))}
    </div>
  </div>
</div>

  );
};

export default ChefConcept;
