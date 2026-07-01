import React, { useState, useEffect, useRef } from 'react';
import './SocialFloatingButton.css';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color: string;
}

export default function SocialFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const socialLinks: SocialLink[] = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/restaurantsignature77/',
      icon: '/images/instagram.png',
      color: '#E4405F'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61587208464187',
      icon: '/images/facebook.png',
      color: '#1877F2'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@restaurant_signature',
      icon: '/images/tiktok.png',
      color: '#000000'
    }
  ];

  // Fermer le menu au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="social-floating-container" ref={menuRef}>
      {/* Overlay sombre */}
      {isOpen && <div className="social-overlay" onClick={() => setIsOpen(false)} />}

      {/* Bouton principal - IMAGE BRUTE SANS CERCLE */}
      <button 
        className={`social-main-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Ouvrir les réseaux sociaux"
      >
        <img 
          src="/images/reseauxsociaux.png" 
          alt="Réseaux sociaux" 
          className="social-main-icon-img"
        />
      </button>

      {/* Menu des réseaux sociaux */}
      <div className={`social-menu ${isOpen ? 'open' : ''}`}>
        {socialLinks.map((link, index) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-menu-item"
            style={{ 
              animationDelay: `${index * 0.08}s`,
              '--social-color': link.color 
            } as React.CSSProperties}
            onClick={() => setIsOpen(false)}
          >
            <div className="social-menu-item-inner">
              <img src={link.icon} alt={link.name} className="social-menu-icon" />
              <span className="social-menu-label">{link.name}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}