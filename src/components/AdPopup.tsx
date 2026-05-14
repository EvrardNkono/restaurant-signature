// components/AdPopup.tsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./adPopup.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/popups/active" 
  : "https://signature-backend-alpha.vercel.app/api/popups/active";

interface PopupData {
  _id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  duration: number;
  order: number;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
}

const AdPopup: React.FC = () => {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Récupération des popups depuis le backend
  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const response = await axios.get(API_URL);
        const data = response.data.data || [];
        
        if (data.length > 0) {
          setPopups(data);
          setCurrentIndex(0);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Erreur chargement des popups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopups();
  }, []);

  // 2. Fonction pour fermer la popup courante
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      
      // Passer à la popup suivante après fermeture
      if (currentIndex + 1 < popups.length) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setIsVisible(true);
        }, 300); // Petit délai avant la prochaine popup
      }
    }, 500);
  }, [currentIndex, popups.length]);

  // 3. Timer basé sur la durée de la popup courante
  useEffect(() => {
    if (isVisible && popups[currentIndex]) {
      const duration = popups[currentIndex].duration * 1000; // Conversion en ms
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, currentIndex, popups, handleClose]);

  // 4. Réinitialiser l'état quand on change de popup
  useEffect(() => {
    if (popups.length > 0 && currentIndex < popups.length) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [currentIndex, popups.length]);

  if (loading || popups.length === 0 || !isVisible || !popups[currentIndex]) {
    return null;
  }

  const currentPopup = popups[currentIndex];
  

  // Styles dynamiques basés sur la configuration
  const bannerStyle = {
    backgroundColor: currentPopup.backgroundColor || "#2D2422",
    borderColor: currentPopup.textColor || "#D4AF37",
  };

  const textStyle = {
    color: currentPopup.textColor || "#D4AF37",
  };

  const progressBarStyle = {
    backgroundColor: currentPopup.textColor || "#D4AF37",
  };

  return (
    <div 
      className={`ad-floating-banner ${isClosing ? "slide-out" : "slide-in"}`}
      style={bannerStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="close-ad-btn" 
        onClick={handleClose} 
        aria-label="Fermer"
        style={textStyle}
      >
        &times;
      </button>
      
      <div className="ad-flex-container">
        <div className="ad-image-box">
          <img 
            src={currentPopup.image || "/images/placeholder.jpg"} 
            alt={currentPopup.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
            }}
          />
        </div>
        
        <div className="ad-content-box">
          <span className="ad-mini-tag" style={textStyle}>À découvrir</span>
          <h2 className="ad-title" style={{ color: currentPopup.textColor }}>
            {currentPopup.title}
          </h2>
          <p className="ad-text" style={{ color: currentPopup.textColor }}>
            {currentPopup.description}
          </p>
          <div 
            className="ad-progress-bar" 
            style={progressBarStyle}
            key={currentPopup._id} // Force la réanimation du CSS
          ></div>
        </div>
      </div>

      {/* Indicateur de progression (combien de popups restantes) */}
      {popups.length > 1 && (
        <div className="ad-pagination">
          {popups.map((_, idx) => (
            <span 
              key={idx} 
              className={`ad-dot ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? 'passed' : ''}`}
              style={{ backgroundColor: idx === currentIndex ? currentPopup.textColor : 'rgba(212, 175, 55, 0.3)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdPopup;