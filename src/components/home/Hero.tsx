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

  return (
    <section className="hero">
      <div className="hero-container">
        {/* PARTIE GAUCHE - IMAGE */}
        <div className="hero-left">
          <div className="image-badge">
            <ChefHat size={16} />
            <span>Plat Signature</span>
          </div>
          <div className="image-circle">
            <img 
              src={heroImages[current]} 
              alt="Plat signature" 
              key={current}
              loading="eager"
            />
          </div>
          <div className="image-indicators">
            {heroImages.map((_, idx) => (
              <button 
                key={idx} 
                className={`indicator ${current === idx ? "active" : ""}`}
                onClick={() => setCurrent(idx)}
              />
            ))}
          </div>
        </div>

        {/* PARTIE DROITE - TEXTE */}
        <div className="hero-right">
          <div className="hero-sup-title">
            <Sparkles size={12} />
            <span>L'Excellence à table</span>
          </div>
          
          <h1>
            {title.split(" ").map((word, i) => 
              word.toLowerCase() === "signature" ? (
                <span key={i} className="gold-word">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>
          
          <div className="hero-divider">
            <span></span>
            <Star size={14} fill="#D4AF37" color="#D4AF37" />
            <span></span>
          </div>
          
          <p>{subtitle}</p>
          
          <button className="reserve-btn" onClick={handleCtaClick}>
            <span>{ctaText}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}