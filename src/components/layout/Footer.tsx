import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top-ornament">
        <span className="ornament-line"></span>
        <span className="ornament-text">Une table, une histoire</span>
        <span className="ornament-line"></span>
      </div>

      <div className="footer-container">
        {/* Branding - Gourmand & Délicat */}
        <div className="footer-brand">
          <h2 className="brand-title">
            Restaurant <span className="gold-italic">Signature</span>
          </h2>
          <p className="brand-description">
            Plus qu'une cuisine, une émotion brute. Nous sublimons les trésors 
            du terroir avec la délicatesse d'un savoir-faire contemporain.
          </p>

          <div className="footer-socials">
            <a href="#" className="social-link">Instagram</a>
            <span className="social-divider">/</span>
            <a href="#" className="social-link">Facebook</a>
            <span className="social-divider">/</span>
            <a href="#" className="social-link">WhatsApp</a>
          </div>
        </div>

        {/* Navigation - Soignée */}
        <div className="footer-nav">
          <h4 className="footer-label">Exploration</h4>
          <ul className="nav-list">
            <li><a href="#">La Carte</a></li>
            <li><a href="#">Notre Philosophie</a></li>
            <li><a href="#">Privatisation</a></li>
            <li><a href="#">Réservations</a></li>
          </ul>
        </div>

        {/* Infos - Précises & Attentionnées */}
        <div className="footer-contact">
          <h4 className="footer-label">Rendez-vous</h4>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <p>Quartier Bastos, Yaoundé</p>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🕒</span>
            <p>Mardi — Dimanche : 12h - 23h</p>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <p>+237 6XX XXX XXX</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© 2026 SIGNATURE — ÉLÉGANCE CULINAIRE</p>
          <div className="designer-credit">Design par <span>L'Artiste</span></div>
        </div>
      </div>
    </footer>
  );
}