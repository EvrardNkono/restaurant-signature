import { useEffect, useState } from "react";
import "../../styles/SignatureCarousel.css";

const slides = [
  {
    image: "src/assets/images/plat-1.jpg",
    text: "Des produits frais, sublimés avec finesse",
  },
  {
    image: "src/assets/images/plat-2.jpeg",
    text: "Une cuisine expressive et généreuse",
  },
  {
    image: "src/assets/images/poulet-braise.jfif",
    text: "Chaque assiette raconte une histoire",
  },
];

export default function SignatureCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="carousel-section">
      {/* Artifices de fond */}
      <div className="carousel-deco-circle left"></div>
      <div className="carousel-deco-circle right"></div>

      <div className="carousel-wrapper">
        {/* Cadre doré raffiné avec espace (offset) */}
        <div className="carousel-gold-frame"></div>

        <div className="signature-carousel-container">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`carousel-slide ${i === index ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="carousel-overlay" />
              <div className="carousel-content">
                <span className="carousel-tag">L'Instant</span>
                <p className="carousel-text">{slide.text}</p>
                <div className="carousel-progress-bar">
                  <div className={`progress-line ${i === index ? "fill" : ""}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}