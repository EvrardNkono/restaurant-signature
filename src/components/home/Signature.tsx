import "./Signature.css";

interface SignatureProps {
  title: string;
  text: string;
  image?: string;
  reverse?: boolean;
}

export default function Signature({ title, text, image, reverse }: SignatureProps) {
  return (
    <section className={`signature-section ${reverse ? "reverse" : ""}`}>
      <div className="signature-inner-content">
        
        <div className="signature-image-wrapper">
          {image && <img src={image} alt={title} className="signature-image" />}
          <div className="signature-frame"></div>
        </div>

        <div className="signature-text-block">
          <span className="signature-badge">L'art culinaire</span>
          <h2 className="signature-title">{title}</h2>
          <div className="signature-accent"></div>
          <p className="signature-text">{text}</p>
          <button className="signature-button">
            Notre Philosophie
            <span className="button-line"></span>
          </button>
        </div>

      </div>
    </section>
  );
}