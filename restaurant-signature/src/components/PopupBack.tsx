// src/components/PopupBack.tsx

import './PopupBack.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const PopupBack = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="popup-back-container">
      <button className="popup-back-button" onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="popup-back-content">
        <h2 style={{ margin: 0 }}>Retour</h2>
      </div>
    </div>
  );
};

export default PopupBack;
