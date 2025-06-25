import menuData from '../data/menuData';
import DishCard from './DishCard';
import './Boissons.css';

const Boissons = () => {
  const boissons = menuData.filter(dish => dish.category === 'Boissons');

  return (
    <div className="categorie-section">
      <h2>Boissons</h2>
      <div className="dish-grid">
        {boissons.map(dish => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
};

export default Boissons;
