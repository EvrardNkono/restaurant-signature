import React, { useState, useEffect } from "react";
import "./adPopup.css";

interface AdPopupProps {
  image?: string;
  word?: string;
}

const AdPopup: React.FC<AdPopupProps> = ({ 
  // On s'assure que le chemin commence par un slash pour le dossier public
  image = "/images/plat3.jpg", 
  word = "SIGNATURE" 
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isClosing, setIsClosing] = useState<boolean>(false);

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
          {/* L'image est chargée depuis le dossier public */}
          <img 
            src={image} 
            alt="Promotion" 
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error("Image introuvable sur :", target.src);
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