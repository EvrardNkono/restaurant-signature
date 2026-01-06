// Hero.tsx
import { useState, useEffect } from "react";
import "./Hero.css";

const heroImages = [
  "/images/plat1.jpg",
  "/images/plat2.jpg",
  "/images/plat3.jpg",
];

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
}

export default function Hero({ title, subtitle, ctaText }: HeroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      {/* Ajout de hero-container pour que le CSS flex-direction s'applique bien */}
      <div className="hero-container">
        
        <div className="hero-left">
          <div className="image-circle">
            <img src={heroImages[current]} alt="Plat du restaurant" />
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