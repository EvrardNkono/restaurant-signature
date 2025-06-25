import React from 'react';
import './ScrollTopPopup.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const ScrollTopPopup: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="scroll-top-popup-overlay" /* pas de onClick pour fermer ici */>
      <div className="scroll-top-popup" onClick={e => e.stopPropagation()}>
        <h3>Besoin de revenir en haut ?</h3>
        <button onClick={scrollToTop} className="scroll-btn">
          <FontAwesomeIcon icon={faArrowUp} /> Retour en haut
        </button>
      </div>
    </div>
  );
};

export default ScrollTopPopup;
