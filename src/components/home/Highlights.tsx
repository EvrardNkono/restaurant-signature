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
    <section 
      className="highlights-section" 
      aria-labelledby="highlights-title"
    >
      <div className="highlights-header">
        <span 
          className="highlights-badge" 
          aria-label="Sélection des plats incontournables"
        >
          La Sélection
        </span>
        <h2 id="highlights-title" className="highlights-main-title">
          Incontournables
        </h2>
        <div className="highlights-ornament" aria-hidden="true"></div>
      </div>

      <div 
        className="highlights-grid" 
        role="list" 
        aria-label="Liste des plats incontournables"
      >
        {items.map((item, index) => (
          <div 
            key={item.name} 
            className="highlight-item-container"
            role="listitem"
            aria-label={`Plat ${index + 1} : ${item.name}, ${item.price}`}
          >
            <div className="highlight-card">
              <div className="highlight-image-wrapper">
                <img 
                  src={item.image} 
                  alt={`${item.name} - ${item.price}`}
                  className="highlight-image"
                  loading="lazy"
                />
                <div 
                  className="highlight-price-overlay" 
                  aria-label={`Prix : ${item.price}`}
                >
                  {item.price}
                </div>
              </div>
              <div className="highlight-info">
                <h3 className="highlight-name">{item.name}</h3>
                <div className="highlight-line" aria-hidden="true"></div>
              </div>
            </div>
            <div className="highlight-corner-gold" aria-hidden="true"></div>
          </div>
        ))}
      </div>
    </section>
  );
}