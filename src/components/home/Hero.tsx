import { useState, useEffect } from "react";
import axios from "axios";
import "./Hero.css";

// Fallback : images par défaut si la base de données est vide
const defaultImages = [
  "/images/plat1.jpg",
  "/images/plat2.jpg",
  "/images/plat3.jpg",
];

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/banner" 
  : "https://signature-backend-alpha.vercel.app/api/banner";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
}

export default function Hero({ title, subtitle, ctaText }: HeroProps) {
  const [heroImages, setHeroImages] = useState<string[]>(defaultImages);
  const [current, setCurrent] = useState(0);

  // 1. Récupération des images depuis MongoDB
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data.images && response.data.images.length > 0) {
          setHeroImages(response.data.images);
        }
      } catch (error) {
        console.error("Erreur chargement bannière:", error);
      }
    };
    fetchBanner();
  }, []);

  // 2. Logique du slider automatique
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [heroImages]);

  // 3. Déclencheur pour le FloatingOrder
  const handleCtaClick = () => {
    // On crée et diffuse l'événement que FloatingOrder écoute
    const event = new CustomEvent("openReservation");
    window.dispatchEvent(event);
  };

  return (
    <section className="hero">
      <div className="hero-container">
        
        <div className="hero-left">
          <div className="image-circle">
            <img 
              src={heroImages[current]} 
              alt="Plat signature" 
              key={current} // Crucial pour déclencher l'animation CSS au changement
              loading="eager"
            />
          </div>
        </div>

        <div className="hero-right">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          
          {/* Le bouton déclenche maintenant l'ouverture du menu flottant */}
          <button 
            className="reserve-btn" 
            onClick={handleCtaClick}
          >
            {ctaText}
          </button>
        </div>

      </div>
    </section>
  );
}