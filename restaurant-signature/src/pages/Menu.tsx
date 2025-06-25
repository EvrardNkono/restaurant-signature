import { useState, useEffect, useRef } from 'react';
import Entrées from '../components/Entrées';
import Plats from '../components/Plats';
import Desserts from '../components/Desserts';
import Boissons from '../components/Boissons';
import backgroundMenu from '../assets/images/background-menu.jpeg';



import './Menu.css';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  // Récupérer le panier via le contexte

  // Calculer le nombre total d'articles dans le panier
 

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 0) return;

      if (currentScrollY > lastScrollY.current) {
        // Scroll vers le bas => cacher la bannière
        setShowBanner(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scroll vers le haut => montrer la bannière
        setShowBanner(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        return <p className="centered-message">Choisissez une catégorie pour voir les plats.</p>;

    }
  };

  return (
    <div className="menu-page" style={{ position: 'relative' }}>
      {/* Bannière avec image + boutons superposés */}
      <div
        className="menu-banner-with-buttons"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${backgroundMenu})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '12px',
          height: '150px',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',

          transition: 'transform 0.3s ease, opacity 0.3s ease',
          transform: showBanner ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showBanner ? 1 : 0,
          pointerEvents: showBanner ? 'auto' : 'none',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <h1 className="title">Menu</h1>
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
          marginTop: '40px', // pour laisser la place au panier
        }}
      >
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
