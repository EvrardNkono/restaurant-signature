import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, X } from "lucide-react";
import "./CtaFinal.css";

interface CtaFinalProps {
  text: string;
  title?: string;
}

export default function CtaFinal({ text, title = "Prêt pour l'expérience ?" }: CtaFinalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="cta-final-section">
      <div className="cta-container" ref={containerRef}>
        <div className="cta-border-decoration top"></div>
        
        <div className="cta-content">
          <h2 className="cta-title">{title}</h2>
          
          <div className="cta-ornament">
            <span className="dot gold"></span>
          </div>
          
          <div className="cta-button-wrapper">
            {/* LE TIROIR DE SÉLECTION */}
            <div className={`menu-choice-drawer ${isOpen ? "active" : ""}`}>
              <div className="drawer-header-mini">
                <span>Sélectionnez votre carte</span>
                <button onClick={() => setIsOpen(false)} className="close-mini-drawer">
                  <X size={16} />
                </button>
              </div>
              
              <div className="drawer-actions">
  <Link to="/menu" className="choice-btn btn-day">
    <Sun size={20} className="icon-day" />
    <div className="choice-text">
      <span className="main-choice">Menu Jour</span>
      <span className="sub-choice">11h30 - 15h00</span>
    </div>
  </Link>

  <Link to="/menu-soir" className="choice-btn btn-night">
    <Moon size={20} className="icon-night" />
    <div className="choice-text">
      <span className="main-choice">Menu Soir</span>
      <span className="sub-choice">19h00 - 23h00</span>
    </div>
  </Link>
</div>
              <div className="drawer-arrow"></div>
            </div>

            {/* LE BOUTON DÉCLENCHEUR */}
            <button 
              className={`cta-button ${isOpen ? "is-active" : ""}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="button-text">{isOpen ? "Choisissez..." : text}</span>
            </button>
          </div>
        </div>

        <div className="cta-border-decoration bottom"></div>
      </div>
    </section>
  );
}