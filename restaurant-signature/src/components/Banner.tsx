import { useNavigate } from 'react-router-dom';
import bannerBg from '../assets/images/banner-bg.jpg'; // ajuste le chemin selon ta structure
import './Banner.css';

const Banner = () => {
  const navigate = useNavigate();

  const goToMenu = () => {
    navigate('/menu');
  };

  return (
    <div
      className="banner"
      style={{
        backgroundImage: `url(${bannerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        width: '100vw',
        height: '100vh',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Overlay violet semi-transparent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(102, 51, 153, 0.4)', // opacité 40%
          zIndex: 1,
        }}
      />

      <div className="banner-content" style={{ position: 'relative', zIndex: 2, maxWidth: 800, padding: '0 1rem' }}>
        <h1>Bienvenue sur Restaurant Signature</h1>
        <p>Découvrez nos saveurs exotiques</p>
        <button className="banner-button" onClick={goToMenu}>
          Voir le menu
        </button>
      </div>
    </div>
  );
};

export default Banner;
