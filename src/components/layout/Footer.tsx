import React from 'react';
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import "./footer.css";

export default function Footer() {
  
  const handleReservationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openReservation'));
  };

  const getOpeningHours = () => {
    const days = [
      { name: "Lundi", open: false, lunch: null, dinner: null },
      { name: "Mardi", open: true, lunch: { start: "12h00", end: "15h00" }, dinner: { start: "18h00", end: "23h00" } },
      { name: "Mercredi", open: true, lunch: { start: "12h00", end: "15h00" }, dinner: { start: "18h00", end: "23h00" } },
      { name: "Jeudi", open: true, lunch: { start: "12h00", end: "15h00" }, dinner: { start: "18h00", end: "23h00" } },
      { name: "Vendredi", open: true, lunch: { start: "12h00", end: "15h00" }, dinner: { start: "18h00", end: "23h00" } },
      { name: "Samedi", open: true, lunch: { start: "10h00", end: "15h00" }, dinner: { start: "18h00", end: "00h00" } },
      { name: "Dimanche", open: true, lunch: { start: "10h00", end: "15h00" }, dinner: { start: "18h00", end: "00h00" } }
    ];
    return days;
  };

  const openingHours = getOpeningHours();
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  const todaySchedule = openingHours[todayIndex];

  const getTodayHoursText = () => {
    if (!todaySchedule.open) return "Aujourd'hui : Fermé";
    const lunchText = todaySchedule.lunch ? `${todaySchedule.lunch.start} - ${todaySchedule.lunch.end}` : "";
    const dinnerText = todaySchedule.dinner ? `${todaySchedule.dinner.start} - ${todaySchedule.dinner.end}` : "";
    if (lunchText && dinnerText) return `Aujourd'hui : ${lunchText} / ${dinnerText}`;
    if (lunchText) return `Aujourd'hui : ${lunchText}`;
    if (dinnerText) return `Aujourd'hui : ${dinnerText}`;
    return "Aujourd'hui : Fermé";
  };

  // Détection du mobile
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  };

  // Gestion du clic pour TikTok
  const handleTikTokClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();

    if (isMobile()) {
      window.location.href = 'tiktok://user?@restaurant_signature';
      setTimeout(() => {
        window.open(url, '_blank');
      }, 800);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Gestion du clic pour Instagram
  const handleInstagramClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open('https://www.instagram.com/restaurantsignature77/', '_blank', 'noopener,noreferrer');
  };

  // Gestion du clic pour Facebook
  const handleFacebookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open('https://www.facebook.com/profile.php?id=61587208464187', '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="footer">
      <div className="footer-top-ornament">
        <span className="ornament-line"></span>
        <span className="ornament-text">Une table, une histoire</span>
        <span className="ornament-line"></span>
      </div>

      <div className="footer-container">
        <div className="footer-brand">
          <h2 className="brand-title">
            Restaurant <span className="gold-italic">Signature</span>
          </h2>
          <p className="brand-description">
            Plus qu'une cuisine, une émotion brute. Nous sublimons les trésors 
            du terroir avec la délicatesse d'un savoir-faire contemporain.
          </p>

          {/* ============================================================ */}
          {/* RÉSEAUX SOCIAUX - SANS WHATSAPP AVEC TIKTOK MOBILE */}
          {/* ============================================================ */}
          <div className="footer-socials">
            <a 
              href="https://www.instagram.com/restaurantsignature77/" 
              className="social-icon-link" 
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInstagramClick}
            >
              <img 
                src="/images/instagram.png" 
                alt="Instagram" 
                className="social-icon-img" 
              />
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61587208464187" 
              className="social-icon-link" 
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleFacebookClick}
            >
              <img 
                src="/images/facebook.png" 
                alt="Facebook" 
                className="social-icon-img" 
              />
            </a>
            <a 
              href="https://www.tiktok.com/@restaurant_signature" 
              className="social-icon-link" 
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleTikTokClick(e, 'https://www.tiktok.com/@restaurant_signature')}
            >
              <img 
                src="/images/tiktok.png" 
                alt="TikTok" 
                className="social-icon-img" 
              />
            </a>
          </div>
        </div>

        <div className="footer-nav">
          <h3 className="footer-label">Exploration</h3>
          <ul className="nav-list">
            <li><a href="#menu">La Carte</a></li>
            <li><a href="#philosophie">Notre Philosophie</a></li>
            <li><a href="#privatisation" className="nav-link-highlight">Privatisation</a></li>
            <li>
              <a href="#reservations" className="nav-link-cta" onClick={handleReservationClick}>
                Réservations
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4 className="footer-label">Rendez-vous</h4>
          <div className="contact-item">
            <MapPin size={18} className="gold-text" strokeWidth={1} />
            <p>13 Rue Saint-Barthélémy, 77000 Melun</p>
          </div>
          <div className="contact-item">
            <Clock size={18} className="gold-text" strokeWidth={1} />
            <div className="hours-details">
              <p className={!todaySchedule.open ? "closed-today" : "open-today"}>
                {getTodayHoursText()}
              </p>
              <div className="hours-list">
                <p><span className="gold-text">Mardi - Vendredi</span> : 12h00 - 15h00 / 18h00 - 23h00</p>
                <p><span className="gold-text">Samedi - Dimanche</span> : 12h00 - 00h00 </p>
                <p><span className="gold-text">Lundi</span> : Fermé</p>
              </div>
            </div>
          </div>
          <div className="contact-item">
            <Phone size={18} className="gold-text" strokeWidth={1} />
            <a href="tel:+33183865812" className="contact-link">+33 1 83 86 58 12</a>
          </div>
          <div className="contact-item">
            <Mail size={18} className="gold-text" strokeWidth={1} />
            <a href="mailto:restaurantsignature@outlook.fr" className="contact-link">
              restaurantsignature@outlook.fr
            </a>
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