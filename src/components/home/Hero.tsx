import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat, PenTool, ArrowRight } from "lucide-react";
import { useRestaurantHours } from "../../hooks/useRestaurantHours";
import { getOrderTarget } from "../../utils/orderTarget";
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
  const navigate = useNavigate();
  const { currentPeriod } = useRestaurantHours();
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

  // Mène directement au menu du moment (au lieu d'ouvrir le petit bouton flottant)
  const handleCtaClick = () => {
    navigate(getOrderTarget(currentPeriod));
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
    <section className="hero-v2" aria-label="Section héro avec carrousel d'images">
      <div className="hero-v2-container">

        {/* PARTIE GAUCHE - LE SCEAU (carrousel photo) */}
        <div className="hero-v2-visual" aria-label="Carrousel des plats signatures">
          <div className="seal-glow" aria-hidden="true"></div>

          <div className="seal" role="group" aria-label={`Image ${current + 1} sur ${heroImages.length}`}>
            <div className="seal-photo">
              <img
                src={heroImages[current]}
                alt={`Plat signature du restaurant - Image ${current + 1}`}
                key={current}
                loading="eager"
              />
            </div>
            <div className="seal-ribbon" aria-hidden="true">
              <span>Plat Signature</span>
            </div>
          </div>

          {/* INDICATEURS DE CARROUSEL AVEC NOMS ACCESSIBLES */}
          <div className="seal-indicators" role="tablist" aria-label="Navigation du carrousel">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                className={`seal-dot ${current === idx ? "active" : ""}`}
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

          {/* BOUTONS DE NAVIGATION PRÉCÉDENT/SUIVANT */}
          {heroImages.length > 1 && (
            <div className="seal-nav" aria-label="Navigation du carrousel">
              <button
                className="seal-nav-btn seal-prev"
                onClick={goToPreviousImage}
                aria-label="Image précédente"
              >
                ←
              </button>
              <button
                className="seal-nav-btn seal-next"
                onClick={goToNextImage}
                aria-label="Image suivante"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* PARTIE DROITE - TEXTE */}
        <div className="hero-v2-content">
          <div className="hero-v2-eyebrow" aria-label="Sous-titre décoratif">
            <ChefHat size={14} aria-hidden="true" />
            <span>Le Sceau du Chef</span>
          </div>

          <h1 className="hero-v2-heading" aria-label={title}>
            {title.split(" ").map((word, i) =>
              word.toLowerCase() === "signature" ? (
                <span key={i} className="foil-word" aria-label="mot Signature en couleur or">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          {/* LIGNE DE SIGNATURE */}
          <div className="hero-v2-signature-line" aria-hidden="true">
            <span className="signature-rule"></span>
            <PenTool size={16} className="signature-mark" aria-hidden="true" />
            <span className="signature-rule"></span>
          </div>

          <p className="hero-v2-lede" aria-label={subtitle}>{subtitle}</p>

          <button
            className="hero-v2-cta"
            onClick={handleCtaClick}
            aria-label={`${ctaText} - voir le menu et passer commande`}
          >
            <span>{ctaText}</span>
            <span className="cta-circle" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
          </button>
          <p className="hero-v2-howto">Commandez en ligne en quelques clics</p>
          <Link to="/reservation" className="hero-v2-cta-secondary">
            Réserver une table
          </Link>
        </div>
      </div>
    </section>
  );
}