import "./CtaFinal.css";

interface CtaFinalProps {
  text: string;
  title?: string;
}

export default function CtaFinal({ text, title = "Prêt pour l'expérience ?" }: CtaFinalProps) {
  return (
    <section className="cta-final-section">
      <div className="cta-container">
        {/* Artifice : Bordures décoratives internes */}
        <div className="cta-border-decoration top"></div>
        
        <div className="cta-content">
          <h2 className="cta-title">{title}</h2>
          <div className="cta-ornament">
            <span className="dot gold"></span>
          </div>
          <button className="cta-button">
            <span className="button-text">{text}</span>
            <span className="button-border"></span>
          </button>
        </div>

        <div className="cta-border-decoration bottom"></div>
      </div>
    </section>
  );
}