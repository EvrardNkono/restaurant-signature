import { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, 
  Maximize2, Heart, Camera, Star
} from 'lucide-react';
import './Gallery.css';

// 📸 CHEMIN CORRIGÉ - Les espaces sont encodés ou remplacés
const galleryImages = [
  { 
    src: "/Images/resto%20(1).webp",  // ✅ %20 pour l'espace
    alt: "Salle principale du restaurant Signature",
    category: "Salle"
  },
  { 
    src: "/Images/resto%20(2).webp",  // ✅ %20 pour l'espace
    alt: "Bar et comptoir Signature",
    category: "Bar"
  },
  { 
    src: "/Images/resto%20(3).webp",  // ✅ %20 pour l'espace
    alt: "Terrasse extérieure",
    category: "Terrasse"
  },
  { 
    src: "/Images/resto%20(4).webp",  // ✅ %20 pour l'espace
    alt: "Cuisine ouverte Signature",
    category: "Cuisine"
  },
  { 
    src: "/Images/resto%20(5).webp",  // ✅ %20 pour l'espace
    alt: "Détails et décoration",
    category: "Détails"
  },
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const galleryRef = useRef<HTMLDivElement>(null);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Effet d'entrée des images au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleImages(prev => 
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    const items = document.querySelectorAll('.gallery-item-enhanced');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'auto';
  };

  const navigateLightbox = (direction: number) => {
    if (selectedIndex === null || isAnimating) return;
    setIsAnimating(true);
    const newIndex = (selectedIndex + direction + galleryImages.length) % galleryImages.length;
    setSelectedIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const toggleLike = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
    console.error(`❌ Image non trouvée: ${galleryImages[index].src}`);
  };

  // Raccourci clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  return (
    <section className="gallery-section-enhanced" ref={galleryRef} aria-label="Galerie photo du restaurant Signature">
      
      {/* EN-TÊTE DE LA GALERIE */}
      <div className="gallery-header-enhanced">
        <div className="gallery-header-content">
          <div className="gallery-badge">
            <Camera size={16} />
            <span>Galerie</span>
          </div>
          <h2 className="gallery-title">
            L'Ambiance <span className="gold-text">Signature</span>
          </h2>
          <div className="gallery-divider">
            <span className="divider-line"></span>
            <Star size={20} className="divider-icon" />
            <span className="divider-line"></span>
          </div>
          <p className="gallery-subtitle">
            Découvrez l'univers raffiné de notre restaurant,<br />
            où chaque espace raconte une histoire de goût et d'élégance.
          </p>
        </div>
      </div>

      {/* GRILLE DES PHOTOS */}
      <div className="gallery-grid-enhanced">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            data-index={index}
            className={`gallery-item-enhanced 
              ${visibleImages.includes(index) ? 'visible' : ''} 
              ${hoveredIndex === index ? 'hovered' : ''}`}
            style={{ animationDelay: `${index * 0.08}s` }}
            onClick={() => openLightbox(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="gallery-item-inner">
              {!imageErrors.has(index) ? (
                <img
                  src={image.src}
                  alt={image.alt}
                  className="gallery-image-enhanced"
                  loading="lazy"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="gallery-image-fallback">
                  <Camera size={48} />
                  <span>Image {index + 1}</span>
                </div>
              )}
              
              {/* CATÉGORIE EN SURIMPOSITION */}
              <div className="gallery-category-tag">
                <span>{image.category}</span>
              </div>

              {/* OVERLAY AU HOVER */}
              <div className="gallery-overlay-enhanced">
                <div className="overlay-content">
                  <div className="overlay-header">
                    <h3 className="overlay-title">{image.category}</h3>
                    <button 
                      className="overlay-like-btn"
                      onClick={(e) => toggleLike(index, e)}
                    >
                      <Heart 
                        size={18} 
                        fill={likedImages.has(index) ? '#E74C3C' : 'none'}
                        color={likedImages.has(index) ? '#E74C3C' : 'white'}
                      />
                    </button>
                  </div>
                  <p className="overlay-description">{image.alt}</p>
                  <div className="overlay-actions">
                    <span className="overlay-view">
                      <Maximize2 size={14} />
                      Voir
                    </span>
                    <span className="overlay-number">{index + 1}/{galleryImages.length}</span>
                  </div>
                </div>
              </div>

              {/* BADGE DE COMPTEUR (Mobile) */}
              <div className="gallery-mobile-badge">
                <span>{index + 1}</span>
                <span>/</span>
                <span>{galleryImages.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {selectedIndex !== null && (
        <div className="lightbox-enhanced" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="lightbox-close" onClick={closeLightbox}>
              <X size={28} />
            </button>

            <button 
              className="lightbox-nav prev" 
              onClick={() => navigateLightbox(-1)}
              aria-label="Image précédente"
            >
              <ChevronLeft size={36} />
            </button>
            <button 
              className="lightbox-nav next" 
              onClick={() => navigateLightbox(1)}
              aria-label="Image suivante"
            >
              <ChevronRight size={36} />
            </button>

            <div className="lightbox-image-container">
              {!imageErrors.has(selectedIndex) ? (
                <img
                  src={galleryImages[selectedIndex].src}
                  alt={galleryImages[selectedIndex].alt}
                  className={`lightbox-image ${isAnimating ? 'animating' : ''}`}
                  onError={() => handleImageError(selectedIndex)}
                />
              ) : (
                <div className="lightbox-fallback">
                  <Camera size={64} />
                  <span>Image non disponible</span>
                </div>
              )}
            </div>

            <div className="lightbox-info">
              <div className="lightbox-info-inner">
                <div className="lightbox-category">{galleryImages[selectedIndex].category}</div>
                <h3 className="lightbox-title">{galleryImages[selectedIndex].category}</h3>
                <p className="lightbox-description">{galleryImages[selectedIndex].alt}</p>
                <div className="lightbox-meta">
                  <span className="lightbox-counter">
                    {selectedIndex + 1} / {galleryImages.length}
                  </span>
                  <button 
                    className="lightbox-like"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(selectedIndex, e);
                    }}
                  >
                    <Heart 
                      size={18} 
                      fill={likedImages.has(selectedIndex) ? '#E74C3C' : 'none'}
                      color={likedImages.has(selectedIndex) ? '#E74C3C' : 'white'}
                    />
                    {likedImages.has(selectedIndex) ? 'Favori' : 'Ajouter aux favoris'}
                  </button>
                </div>
              </div>
            </div>

            <div className="lightbox-progress">
              {galleryImages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`progress-dot ${idx === selectedIndex ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}