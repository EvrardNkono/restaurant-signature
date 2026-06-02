import "./Signature.css";

interface SignatureProps {
  title: string;
  text: string;
  image?: string;
  reverse?: boolean;
}

export default function Signature({ title, text, image, reverse }: SignatureProps) {
  return (
    <section 
      className={`signature-section ${reverse ? "reverse" : ""}`}
      aria-labelledby="signature-title"
    >
      <div className="signature-inner-content">
        
        <div className="signature-image-wrapper">
          {image && (
            <img 
              src={image} 
              alt={title} 
              className="signature-image"
              loading="lazy"
            />
          )}
          <div className="signature-frame" aria-hidden="true"></div>
        </div>

        <div className="signature-text-block">
          <span 
            className="signature-badge" 
            aria-label="L'art culinaire - Badge décoratif"
          >
            L'art culinaire
          </span>
          <h2 id="signature-title" className="signature-title">{title}</h2>
          <div className="signature-accent" aria-hidden="true"></div>
          <p className="signature-text">{text}</p>
          <button 
            className="signature-button"
            aria-label="En savoir plus sur notre philosophie culinaire"
          >
            Notre Philosophie
            <span className="button-line" aria-hidden="true"></span>
          </button>
        </div>

      </div>
    </section>
  );
}