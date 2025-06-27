import React from 'react';
import type { Dish } from '../data/types';
import menuData from '../data/menuData';
import DishCard from '../components/DishCard';
import bannerImage from '../assets/chef-banner.jpeg'; // 👈 ici
import './SpecialWeekend.css';

const SpecialWeekend: React.FC = () => {
  const specialDishes = menuData.filter(dish => dish.category === "Spécial Weekend");

  return (
    <div className="special-weekend-container">
      <div className="special-banner">
        <img
          src={bannerImage}
          alt="Bannière Spécial Weekend"
          className="banner-image"
        />
        <div className="banner-overlay" />
        <div className="banner-content">
          <h1 className="fade-in-title">✨ Menus Spécial Weekend ✨</h1>
          <p>Découvrez nos plats exclusifs du weekend pour un festin exotique et inoubliable.</p>
        </div>
      </div>

      <div className="green-bar"></div>

      <div className="chef-quote">
        <blockquote>
          “Le weekend est fait pour savourer ce que la semaine oublie de nous offrir.”
        </blockquote>
      </div>

      <div className="dishes-section">
        <div className="dishes-grid">
          {specialDishes.length === 0 && <p>Aucun plat spécial weekend pour l'instant.</p>}
          {specialDishes.map((dish: Dish) => (
            <DishCard 
              key={dish.id} 
              dish={dish} 
              showQuantityControls={true} 
              isSpecialWeekend={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialWeekend;
