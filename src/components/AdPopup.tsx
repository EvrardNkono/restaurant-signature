import React, { useState, useEffect } from "react";
import "./adPopup.css";

interface AdPopupProps {
  word?: string;
}

const AdPopup: React.FC<AdPopupProps> = ({ 
  word = "SIGNATURE" 
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Chemin direct vers le dossier public
  const imagePath = "/images/plat3.jpg";

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`ad-floating-banner ${isClosing ? "slide-out" : "slide-in"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="close-ad-btn" onClick={handleClose} aria-label="Fermer">
        &times;
      </button>
      
      <div className="ad-flex-container">
        <div className="ad-image-box">
          <img 
            src={imagePath} 
            alt="Promotion" 
            onError={(e) => {
              // Petit fix au cas où le chemin racine "/" poserait problème en local
              const target = e.target as HTMLImageElement;
              if (!target.src.includes(imagePath)) {
                target.src = "images/plat3.jpg";
              }
            }}
          />
        </div>
        
        <div className="ad-content-box">
          <span className="ad-mini-tag">À découvrir</span>
          <h2 className="ad-title">{word}</h2>
          <p className="ad-text">Une expérience culinaire unique.</p>
          <div className="ad-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default AdPopup;