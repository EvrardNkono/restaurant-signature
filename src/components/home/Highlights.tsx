import "./Highlights.css";

interface HighlightItem {
  name: string;
  image: string;
  price: string;
}

interface HighlightsProps {
  items: HighlightItem[];
}

export default function Highlights({ items }: HighlightsProps) {
  return (
    <section className="highlights-section">
      <div className="highlights-header">
        <span className="highlights-badge">La Sélection</span>
        <h2 className="highlights-main-title">Incontournables</h2>
        <div className="highlights-ornament"></div>
      </div>

      <div className="highlights-grid">
        {items.map((item) => (
          <div key={item.name} className="highlight-item-container">
            <div className="highlight-card">
              <div className="highlight-image-wrapper">
                <img src={item.image} alt={item.name} className="highlight-image" />
                <div className="highlight-price-overlay">{item.price}</div>
              </div>
              <div className="highlight-info">
                <h3 className="highlight-name">{item.name}</h3>
                <div className="highlight-line"></div>
              </div>
            </div>
            <div className="highlight-corner-gold"></div>
          </div>
        ))}
      </div>
    </section>
  );
}