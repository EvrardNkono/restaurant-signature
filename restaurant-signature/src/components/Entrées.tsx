import React from 'react';
import menuData from '../data/menuData';
import DishCard from './DishCard';
import './Categorie.css';

const Entrees: React.FC = () => {
  const entrees = menuData.filter(dish => dish.category === 'Entrées');

  return (
    <div className="categorie-section">
      <h2>Entrées</h2>
      <div className="dish-grid">
        {entrees.map(dish => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
};

export default Entrees;
