import React from 'react';
import type { Dish } from '../data/types';
import menuData from '../data/menuData';
import DishCard2 from '../components/DishCard2';  // <-- Import de ta carte
import './SpecialWeekend.css';

const SpecialWeekend: React.FC = () => {
  const specialDishes = menuData.filter(dish => dish.category === "Spécial Weekend");

  return (
    <div className="special-weekend-container">
      <h1>Menus Spécial Weekend</h1>
      <p>Découvrez nos plats exclusifs du weekend, pour un festin exotique !</p>

      <div className="dishes-grid">
        {specialDishes.length === 0 && <p>Aucun plat spécial weekend pour l'instant.</p>}
        {specialDishes.map((dish: Dish) => (
          <DishCard2 key={dish.id} dish={dish} showQuantityControls={true} />
        ))}
      </div>
    </div>
  );
};

export default SpecialWeekend;
