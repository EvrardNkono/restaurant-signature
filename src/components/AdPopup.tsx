import React, { useState, useEffect } from "react";
import axios from "axios";
import "./adPopup.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/ads" 
  : "https://signature-backend-alpha.vercel.app//ads";

interface AdPopupProps {
  word?: string; // Gardé pour la compatibilité, mais sera remplacé par le titre de l'API
}

const AdPopup: React.FC<AdPopupProps> = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [adData, setAdData] = useState({
    title: "",
    description: "",
    image: "",
    isActive: false
  });

  // 1. Récupération de la config depuis le Backend
  useEffect(() => {
    const fetchAdConfig = async () => {
      try {
        const response = await axios.get(API_URL);
        const data = response.data;
        
        // On ne montre la popup que si elle est activée en base de données
        if (data && data.isActive) {
          setAdData(data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Erreur chargement Popup:", error);
      }
    };
    fetchAdConfig();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 500);
  };

  // 2. Timer de fermeture automatique (15s)
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

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
          {/* On utilise l'image venant du backend (Base64 ou URL) */}
          <img 
            src={adData.image || "/images/plat3.jpg"} 
            alt="Promotion" 
          />
        </div>
        
        <div className="ad-content-box">
          <span className="ad-mini-tag">À découvrir</span>
          {/* Titre dynamique */}
          <h2 className="ad-title">{adData.title}</h2>
          {/* Description dynamique */}
          <p className="ad-text">{adData.description}</p>
          <div className="ad-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default AdPopup;