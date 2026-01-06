import "./WhyUs.css";

interface Point {
  icon: string;
  title: string;
  text: string;
}

interface WhyUsProps {
  points: Point[];
}

export default function WhyUs({ points }: WhyUsProps) {
  return (
    <section className="why-us-section">
      {/* Artifices : Demi-cercles raffinés sur les bords */}
      <div className="decoration-half-circle left"></div>
      <div className="decoration-half-circle right"></div>

      <div className="why-us-header">
        <span className="why-us-badge">Distinction</span>
        <h2 className="why-us-main-title">L'Art de vous Recevoir</h2>
        <div className="why-us-ornament">
          <span className="ornament-line"></span>
          <span className="ornament-diamond"></span>
          <span className="ornament-line"></span>
        </div>
      </div>

      <div className="why-us-grid">
        {points.map((p, i) => (
          <div key={i} className="why-us-item-wrapper">
            {/* Le cadre doré flottant (arrière-plan) */}
            <div className="floating-gold-frame"></div>
            
            {/* Le contenu (avant-plan) */}
            <div className="why-us-card">
              <div className="why-us-icon-container">
                <span className="why-us-icon">{p.icon}</span>
              </div>
              <h3 className="why-us-item-title">{p.title}</h3>
              <p className="why-us-text">{p.text}</p>
              <span className="item-number">0{i + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}