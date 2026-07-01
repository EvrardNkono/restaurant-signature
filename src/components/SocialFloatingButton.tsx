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

  // Détection du mobile
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  };

  // Gestion du clic pour TikTok
  const handleTikTokClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    setIsOpen(false);

    // Si on est sur mobile
    if (isMobile()) {
      // Méthode 1: Essayer d'ouvrir l'app TikTok directement
      window.location.href = 'tiktok://user?@restaurant_signature';
      
      // Méthode 2: Fallback vers le site web après 800ms si l'app ne s'ouvre pas
      setTimeout(() => {
        window.open(url, '_blank');
      }, 800);
    } else {
      // Sur desktop, ouverture classique
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Gestion du clic pour les autres réseaux
  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, link: SocialLink) => {
    if (link.name === 'TikTok') {
      handleTikTokClick(e, link.url);
    } else {
      // Instagram et Facebook : ouverture classique
      setIsOpen(false);
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
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
            onClick={(e) => handleSocialClick(e, link)}
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