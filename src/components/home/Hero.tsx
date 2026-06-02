import { useState, useEffect } from "react";
import axios from "axios";
import { ChefHat, Sparkles, ArrowRight, Star } from "lucide-react";
import "./Hero.css";

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

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  const handleCtaClick = () => {
    const event = new CustomEvent("openReservation");
    window.dispatchEvent(event);
  };

  const goToPreviousImage = () => {
    setCurrent((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNextImage = () => {
    setCurrent((prev) => (prev + 1) % heroImages.length);
  };

  // Gestion du clavier pour les indicateurs
  const handleIndicatorKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCurrent(idx);
    }
  };

  return (
    <section className="hero" aria-label="Section héro avec carrousel d'images">
      <div className="hero-container">
        {/* PARTIE GAUCHE - CARROUSEL IMAGES */}
        <div className="hero-left" aria-label="Carrousel des plats signatures">
          <div className="image-badge" aria-label="Badge plat signature">
            <ChefHat size={16} aria-hidden="true" />
            <span>Plat Signature</span>
          </div>
          
          <div className="image-circle" role="group" aria-label={`Image ${current + 1} sur ${heroImages.length}`}>
            <img 
              src={heroImages[current]} 
              alt={`Plat signature du restaurant - Image ${current + 1}`}
              key={current}
              loading="eager"
            />
          </div>
          
          {/* INDICATEURS DE CARROUSEL AVEC NOMS ACCESSIBLES */}
          <div className="image-indicators" role="tablist" aria-label="Navigation du carrousel">
            {heroImages.map((_, idx) => (
              <button 
                key={idx} 
                className={`indicator ${current === idx ? "active" : ""}`}
                onClick={() => setCurrent(idx)}
                onKeyDown={(e) => handleIndicatorKeyDown(e, idx)}
                aria-label={`Aller à l'image ${idx + 1}${current === idx ? ' (image actuelle)' : ''}`}
                aria-current={current === idx ? "true" : "false"}
                role="tab"
                aria-selected={current === idx}
                tabIndex={current === idx ? 0 : -1}
              />
            ))}
          </div>

          {/* BOUTONS DE NAVIGATION PRÉCÉDENT/SUIVANT (optionnel mais recommandé) */}
          {heroImages.length > 1 && (
            <div className="carousel-nav-buttons" aria-label="Navigation du carrousel">
              <button 
                className="carousel-prev" 
                onClick={goToPreviousImage}
                aria-label="Image précédente"
              >
                ←
              </button>
              <button 
                className="carousel-next" 
                onClick={goToNextImage}
                aria-label="Image suivante"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* PARTIE DROITE - TEXTE */}
        <div className="hero-right">
          <div className="hero-sup-title" aria-label="Sous-titre décoratif">
            <Sparkles size={12} aria-hidden="true" />
            <span>L'Excellence à table</span>
          </div>
          
          <h1 aria-label={title}>
            {title.split(" ").map((word, i) => 
              word.toLowerCase() === "signature" ? (
                <span key={i} className="gold-word" aria-label="mot Signature en couleur or">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>
          
          <div className="hero-divider" aria-hidden="true">
            <span></span>
            <Star size={14} fill="#D4AF37" color="#D4AF37" aria-hidden="true" />
            <span></span>
          </div>
          
          <p aria-label={subtitle}>{subtitle}</p>
          
          <button 
            className="reserve-btn" 
            onClick={handleCtaClick}
            aria-label={`${ctaText} - ouvrir le formulaire de réservation`}
          >
            <span>{ctaText}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}