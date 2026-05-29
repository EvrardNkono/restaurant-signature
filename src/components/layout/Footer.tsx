import React from 'react';
import { Instagram, Facebook, MessageCircle, MapPin, Clock, Phone } from "lucide-react";
import "./footer.css";

export default function Footer() {
  
  // Fonction pour ouvrir le popup flottant à distance
  const handleReservationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openReservation'));
  };

  // Horaires d'ouverture (MISES À JOUR)
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

  // Fonction pour formater l'affichage des horaires du jour
  const getTodayHoursText = () => {
    if (!todaySchedule.open) return "Aujourd'hui : Fermé";
    
    const lunchText = todaySchedule.lunch 
      ? `${todaySchedule.lunch.start} - ${todaySchedule.lunch.end}` 
      : "";
    const dinnerText = todaySchedule.dinner 
      ? `${todaySchedule.dinner.start} - ${todaySchedule.dinner.end}` 
      : "";
    
    if (lunchText && dinnerText) {
      return `Aujourd'hui : ${lunchText} / ${dinnerText}`;
    } else if (lunchText) {
      return `Aujourd'hui : ${lunchText}`;
    } else if (dinnerText) {
      return `Aujourd'hui : ${dinnerText}`;
    }
    return "Aujourd'hui : Fermé";
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

          <div className="footer-socials">
            <a href="#" className="social-icon-link" aria-label="Instagram">
              <Instagram size={22} strokeWidth={0.75} />
            </a>
            <a href="#" className="social-icon-link" aria-label="Facebook">
              <Facebook size={22} strokeWidth={0.75} />
            </a>
            <a href="https://wa.me/33662038472" className="social-icon-link" aria-label="WhatsApp">
              <MessageCircle size={22} strokeWidth={0.75} />
            </a>
          </div>
        </div>

        <div className="footer-nav">
          <h4 className="footer-label">Exploration</h4>
          <ul className="nav-list">
            <li><a href="#menu">La Carte</a></li>
            <li><a href="#philosophie">Notre Philosophie</a></li>
            <li>
              <a href="#privatisation" className="nav-link-highlight">
                Privatisation
              </a>
            </li>
            <li>
              <a 
                href="#reservations" 
                className="nav-link-cta"
                onClick={handleReservationClick}
              >
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
                <p><span className="gold-text">Samedi - Dimanche</span> : 10h00 - 15h00 / 18h00 - 00h00</p>
                <p><span className="gold-text">Lundi</span> : Fermé</p>
              </div>
            </div>
          </div>
          <div className="contact-item">
            <Phone size={18} className="gold-text" strokeWidth={1} />
            <a href="tel:+33662038472" className="contact-link">+33 6 62 03 84 72</a>
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