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
  : "https://signature.abbadevelop.net/api/banner";

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
        // Si on reçoit des images, on met à jour le state
        if (response.data.images && response.data.images.length > 0) {
          setHeroImages(response.data.images);
        }
      } catch (error) {
        console.error("Erreur chargement bannière:", error);
        // En cas d'erreur, heroImages garde les defaultImages
      }
    };
    fetchBanner();
  }, []);

  // 2. Logique du slider (inchangée)
  useEffect(() => {
    if (heroImages.length <= 1) return; // Pas de défilement s'il n'y a qu'une image

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Augmenté à 5s pour laisser le temps d'apprécier l'image
    return () => clearInterval(interval);
  }, [heroImages]);

  return (
    <section className="hero">
      <div className="hero-container">
        
        <div className="hero-left">
          <div className="image-circle">
            {/* L'image s'affiche ici, qu'elle soit une URL ou du Base64 */}
            <img 
              src={heroImages[current]} 
              alt="Plat du restaurant" 
              key={current} // Aide React à gérer la transition d'image
            />
          </div>
        </div>

        <div className="hero-right">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <button className="reserve-btn">{ctaText}</button>
        </div>

      </div>
    </section>
  );
}