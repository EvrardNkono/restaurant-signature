import { Link } from "react-router-dom";
import "./CtaFinal.css";

interface CtaFinalProps {
  text: string;
  title?: string;
}

export default function CtaFinal({ text, title = "Prêt pour l'expérience ?" }: CtaFinalProps) {
  return (
    <section className="cta-final-section">
      <div className="cta-container">
        {/* Décorations dorées */}
        <div className="cta-border-decoration top"></div>
        
        <div className="cta-content">
          <h2 className="cta-title">{title}</h2>
          <div className="cta-ornament">
            <span className="dot gold"></span>
          </div>
          
          <Link to="/carte" className="cta-button">
            <span className="button-text">{text}</span>
          </Link>
        </div>

        <div className="cta-border-decoration bottom"></div>
      </div>
    </section>
  );
}