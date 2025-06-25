// Banner.tsx
import { useNavigate } from 'react-router-dom';
import bannerBg from '../assets/images/banner-bg.jpg'; 
import './Banner.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faStar, faAward } from '@fortawesome/free-solid-svg-icons';

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="banner" style={{ backgroundImage: `url(${bannerBg})` }}>
      <div className="overlay" />

      <div className="banner-content">
        <h1>Bienvenue sur Restaurant Signature</h1>
        <p>Découvrez nos saveurs exotiques</p>

        <button className="banner-button" onClick={() => navigate('/menu')}>
          <FontAwesomeIcon icon={faUtensils} className="icon purple-icon" />
          Menu Classique
        </button>

        <div className="btn-group">
          <button className="banner-button" onClick={() => navigate('/special-weekend')}>
            <FontAwesomeIcon icon={faStar} className="icon green-icon" />
            Special Weekend
          </button>
          <button className="banner-button" onClick={() => navigate('/concept-chef')}>
            <FontAwesomeIcon icon={faAward} className="icon gold-icon" />
            Le concept du chef
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
