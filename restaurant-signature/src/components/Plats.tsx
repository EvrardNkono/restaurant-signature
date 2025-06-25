import menuData from '../data/menuData';
import DishCard from './DishCard';
import './Categorie.css';

const Plats = () => {
  const plats = menuData.filter(dish => dish.category === 'Plats');

  return (
    <div className="categorie-section">
      <h2>Plats</h2>
      <div className="dish-grid">
        {plats.map(dish => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
};

export default Plats;
