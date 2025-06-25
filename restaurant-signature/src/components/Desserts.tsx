import menuData from '../data/menuData';
import DishCard from './DishCard';
import './Categorie.css';
import type { Dish } from '../data/types';


const Desserts = () => {
  const desserts = menuData.filter((dish: Dish) => dish.category === 'Desserts');

  return (
    <div className="categorie-section">
      <h2>Desserts</h2>
      <div className="dish-grid">
        {desserts.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
};

export default Desserts;
