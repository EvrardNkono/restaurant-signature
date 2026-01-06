// Hero.tsx
import { useState, useEffect } from "react";
import "./Highlights.css";

// Tableau d'images pour le cercle
const heroImages = [
  "src/assets/images/plat1.jpg",
  "src/assets/images/plat2.jpg",
  "src/assets/images/plat3.jpg",
];

// Définition du type des props
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
    </section>
  );
}
