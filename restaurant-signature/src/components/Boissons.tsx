import { useState } from 'react'; 
import menuData from '../data/menuData';
import DishCard from './DishCard';
import './Boissons.css';

const Boissons = () => {
  const boissons = menuData.filter(dish => dish.category === 'Boissons');

  const subCategories = Array.from(new Set(boissons.map(d => d.subCategory))).filter(Boolean) as string[];

  const [selectedSubCategory, setSelectedSubCategory] = useState<string | 'Toutes'>('Toutes');

  const filteredBoissons = selectedSubCategory === 'Toutes'
    ? boissons
    : boissons.filter(dish => dish.subCategory === selectedSubCategory);

  return (
    <div className="categorie-section">
      <h2>Boissons</h2>

      <label htmlFor="boissons-subcategory-select" className="boissons-filter-label">
        Catégorie de boissons :
      </label>
      <select
        id="boissons-subcategory-select"
        className="boissons-filter-select"
        value={selectedSubCategory}
        onChange={e => setSelectedSubCategory(e.target.value)}
      >
        <option value="Toutes">Toutes</option>
        {subCategories.map(subCat => (
          <option key={subCat} value={subCat}>
            {subCat}
          </option>
        ))}
      </select>

      <div className="dish-grid">
        {filteredBoissons.map(dish => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
};

export default Boissons;
