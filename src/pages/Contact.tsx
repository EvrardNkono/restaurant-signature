import "./contact.css";

export default function Contact() {
  return (
    <section className="contact-page">
      {/* BANNIÈRE TERRACOTTA (Titre uniquement) */}
      <div className="contact-banner-box">
        <div className="contact-header">
          <div className="header-seal">C</div>
          <span className="contact-badge">Réservations & Informations</span>
          <h2 className="contact-main-title">Contactez-nous</h2>
          <div className="header-double-line"></div>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          
          {/* INFOS DE CONTACT */}
          <div className="contact-info">
            <h3 className="gold-section-title">Coordonnées</h3>
            <div className="info-item">
              <h4>Adresse</h4>
              <p>12 Rue de la Gastronomie, 75001 Paris</p>
            </div>
            <div className="info-item">
              <h4>Téléphone</h4>
              <p>01 23 45 67 89</p>
            </div>
            <div className="info-item">
              <h4>Horaires</h4>
              <p>Mardi - Samedi : 12h-14h30 | 19h-22h30</p>
              <p>Dimanche - Lundi : Fermé</p>
            </div>
            <div className="contact-socials">
              <span>Instagram</span> — <span>Facebook</span>
            </div>
          </div>

          {/* FORMULAIRE DE CONTACT */}
          <div className="contact-form-wrapper">
            <div className="gold-thick-border"></div>
            <form className="contact-form">
              <div className="form-group">
                <label>Nom Complet</label>
                <input type="text" placeholder="Votre nom" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="votre@email.com" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows={5} placeholder="Votre demande ou réservation..."></textarea>
              </div>
              <button type="submit" className="submit-btn">Envoyer le message</button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}