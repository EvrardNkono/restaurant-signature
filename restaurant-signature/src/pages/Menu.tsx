import  { useState } from 'react';
import Entrées from '../components/Entrées';
import Plats from '../components/Plats';
import Desserts from '../components/Desserts';
import Boissons from '../components/Boissons';
import backgroundMenu from '../assets/images/background-menu.jpeg';
import './Menu.css';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const renderCategory = () => {
    switch (activeCategory) {
      case 'Entrées':
        return <Entrées />;
      case 'Plats':
        return <Plats />;
      case 'Desserts':
        return <Desserts />;
      case 'Boissons':
        return <Boissons />;
      default:
        return <p>Choisissez une catégorie pour voir les plats.</p>;
    }
  };

  return (
    <div className="menu-page">
      <h1>Menu du Restaurant Signature</h1>

      {/* Bannière avec image + boutons superposés */}
      <div
        className="menu-banner-with-buttons"
        style={{
  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${backgroundMenu})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: '12px',
  position: 'relative',
  height: '150px',
  marginBottom: '20px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
}}

      >
        <div className="menu-buttons-overlay">
          <button onClick={() => setActiveCategory('Entrées')}>Entrées</button>
          <button onClick={() => setActiveCategory('Plats')}>Plats</button>
          <button onClick={() => setActiveCategory('Desserts')}>Desserts</button>
          <button onClick={() => setActiveCategory('Boissons')}>Boissons</button>
        </div>
      </div>

      {/* Conteneur avec image de fond sous les cartes */}
      <div
        className="menu-content-wrapper"
        style={{
          backgroundImage: `url(${backgroundMenu})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px',
          padding: '40px 20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          position: 'relative',
          marginBottom: '40px',
        }}
      >
        {/* Cartes flottantes avec fond blanc semi-transparent */}
        <div
          className="menu-content"
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            position: 'relative',
            zIndex: 10,
            minHeight: '400px',
            color: '#4a0072',
          }}
        >
          {renderCategory()}
        </div>
      </div>
    </div>
  );
};

export default Menu;
