import { useEffect, useRef, useState } from "react";
import { ChevronRight, Crown, Star } from "lucide-react";
import "./Signature.css";

interface SignatureProps {
  title: string;
  text: string;
  image?: string;
  imageSecondary?: string;  // ← AJOUT DE LA PROPRIÉTÉ
  reverse?: boolean;
}

export default function Signature({ 
  title, 
  text, 
  image = "/images/signature-illustration.png",
  imageSecondary = "/images/image-jour.png",  // ← VALEUR PAR DÉFAUT
  reverse = false 
}: SignatureProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`signature-v3 ${reverse ? "reverse" : ""} ${isVisible ? "visible" : ""}`}
      aria-labelledby="signature-title"
    >
      {/* Fond décoratif */}
      <div className="signature-v3-bg-pattern" aria-hidden="true"></div>
      
      <div className="signature-v3-container">
        
        {/* IMAGE - Design en cascade */}
        <div className="signature-v3-image-wrapper">
          <div className="signature-v3-image-cascade">
            
            {/* Image principale en grand format */}
            <div className="signature-v3-image-main">
              <img 
                src={image} 
                alt="Signature culinaire" 
                className="signature-v3-image"
                loading="lazy"
              />
              <div className="signature-v3-image-shine"></div>
            </div>

            {/* Image secondaire en superposition artistique */}
            <div className="signature-v3-image-overlay-container">
              <div className="signature-v3-image-overlay-frame">
                <img 
                  src={imageSecondary} 
                  alt="Détail gastronomique" 
                  className="signature-v3-image-overlay-img"
                  loading="lazy"
                />
                <div className="signature-v3-image-overlay-border"></div>
              </div>
              
              {/* Élément décoratif */}
              <div className="signature-v3-image-accent">
                <Star className="signature-v3-image-accent-icon" />
              </div>
            </div>

          </div>

          {/* Éléments de luxe */}
          <div className="signature-v3-luxury-elements">
            <div className="signature-v3-luxury-line"></div>
            <div className="signature-v3-luxury-dot"></div>
            <div className="signature-v3-luxury-line"></div>
          </div>
        </div>

        {/* TEXTE */}
        <div className="signature-v3-content">
          <div className="signature-v3-header">
            <span className="signature-v3-badge">✦ Notre Signature</span>
            <span className="signature-v3-line"></span>
          </div>

          <h2 id="signature-title" className="signature-v3-title">
            {title}
          </h2>

          <div className="signature-v3-divider" aria-hidden="true">
            <span className="signature-v3-divider-line"></span>
            <div className="signature-v3-divider-icon">
              <Crown size={16} />
            </div>
            <span className="signature-v3-divider-line"></span>
          </div>

          <p className="signature-v3-text">{text}</p>

          <div className="signature-v3-cta-wrapper">
            <button className="signature-v3-cta">
              <span>Découvrir notre histoire</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}