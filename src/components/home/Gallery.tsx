import { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, 
  Maximize2, Heart, Camera, Star, 
  Play, Pause, Sparkles, Clock
} from 'lucide-react';
import './Gallery.css';

const galleryImages = [
  { 
    src: "/Images/resto1.webp",
    category: "Salle",
    description: "Élégance intemporelle"
  },
  { 
    src: "/Images/resto2.webp",
    category: "Bar",
    description: "Art de vivre"
  },
  { 
    src: "/Images/resto3.webp",
    category: "Terrasse",
    description: "Douceur méditerranéenne"
  },
  { 
    src: "/Images/resto4.webp",
    category: "Cuisine",
    description: "Création en mouvement"
  },
  { 
    src: "/Images/resto5.webp",
    category: "Ambiance",
    description: "Lumières et émotions"
  },
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const galleryRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null); // ✅ FIX ICI

  // Auto-play du carousel de la galerie
  useEffect(() => {
    if (isAutoPlay && !selectedIndex) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, selectedIndex]);

  // Intersection Observer pour l'animation d'entrée
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleImages(prev => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.15, rootMargin: '50px' }
    );

    const items = document.querySelectorAll('.gallery-item-premium');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'auto';
    setIsAutoPlay(true);
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

  // Raccourcis clavier
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
    <section className="gallery-section-premium" ref={galleryRef}>
      
      {/* DÉCORATION DE FOND */}
      <div className="gallery-bg-decoration">
        <div className="gallery-glow-1"></div>
        <div className="gallery-glow-2"></div>
      </div>

      {/* EN-TÊTE */}
      <div className="gallery-header-premium">
        <div className="gallery-header-inner">
          <div className="gallery-badge-premium">
            <Camera size={14} />
            <span>Galerie</span>
            <Sparkles size={12} className="badge-sparkle" />
          </div>
          <h2 className="gallery-title-premium">
            <span className="title-line">Notre</span>
            <span className="title-highlight">Univers</span>
          </h2>
          <div className="gallery-divider-premium">
            <span className="divider-bar"></span>
            <Star size={18} className="divider-star" />
            <span className="divider-bar"></span>
          </div>
          <p className="gallery-subtitle-premium">
            Un voyage visuel au cœur de l'excellence
          </p>
        </div>
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="gallery-grid-premium">
        {/* Grande image principale */}
        <div className="gallery-main-premium">
          <div 
            className="gallery-main-image"
            onClick={() => openLightbox(currentIndex)}
          >
            {!imageErrors.has(currentIndex) ? (
              <img
                src={galleryImages[currentIndex].src}
                alt={galleryImages[currentIndex].category}
                className="gallery-main-img"
                onError={() => handleImageError(currentIndex)}
              />
            ) : (
              <div className="gallery-fallback">
                <Camera size={48} />
                <span>Image</span>
              </div>
            )}
            <div className="gallery-main-overlay">
              <div className="main-overlay-content">
                <span className="main-category">{galleryImages[currentIndex].category}</span>
                <p className="main-description">{galleryImages[currentIndex].description}</p>
                <button className="main-view-btn">
                  <Maximize2 size={16} />
                  <span>Explorer</span>
                </button>
              </div>
            </div>
            <div className="gallery-main-badge">
              <span>{currentIndex + 1}</span>
              <span>/</span>
              <span>{galleryImages.length}</span>
            </div>
          </div>
          
          {/* Contrôles du carousel */}
          <div className="gallery-controls">
            <button 
              className="control-btn"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="control-btn autoplay"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
            >
              {isAutoPlay ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button 
              className="control-btn"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % galleryImages.length)}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Indicateurs */}
          <div className="gallery-indicators">
            {galleryImages.map((_, idx) => (
              <div
                key={idx}
                className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* Miniatures latérales */}
        <div className="gallery-thumbs-premium">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              data-index={index}
              className={`gallery-thumb-item ${visibleImages.has(index) ? 'visible' : ''} ${index === currentIndex ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="thumb-image-wrapper">
                {!imageErrors.has(index) ? (
                  <img
                    src={image.src}
                    alt={image.category}
                    className="thumb-image"
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <div className="thumb-fallback">
                    <Camera size={20} />
                  </div>
                )}
                <div className="thumb-overlay">
                  <span className="thumb-category">{image.category}</span>
                </div>
              </div>
              <button 
                className="thumb-like"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(index, e);
                }}
              >
                <Heart 
                  size={14} 
                  fill={likedImages.has(index) ? '#E74C3C' : 'none'}
                  color={likedImages.has(index) ? '#E74C3C' : 'rgba(255,255,255,0.6)'}
                />
              </button>
              {index === currentIndex && (
                <div className="thumb-active-indicator">
                  <span className="active-line"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX DE LUXE */}
      {selectedIndex !== null && (
        <div className="lightbox-premium" onClick={closeLightbox}>
          <div className="lightbox-premium-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Header Lightbox */}
            <div className="lightbox-premium-header">
              <div className="lightbox-premium-info">
                <span className="lightbox-premium-category">
                  {galleryImages[selectedIndex].category}
                </span>
                <span className="lightbox-premium-counter">
                  {selectedIndex + 1} / {galleryImages.length}
                </span>
              </div>
              <div className="lightbox-premium-actions">
                <button 
                  className="lightbox-premium-btn like"
                  onClick={(e) => toggleLike(selectedIndex, e)}
                >
                  <Heart 
                    size={20} 
                    fill={likedImages.has(selectedIndex) ? '#E74C3C' : 'none'}
                    color={likedImages.has(selectedIndex) ? '#E74C3C' : 'white'}
                  />
                </button>
                <button className="lightbox-premium-btn close" onClick={closeLightbox}>
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="lightbox-premium-image">
              {!imageErrors.has(selectedIndex) ? (
                <img
                  src={galleryImages[selectedIndex].src}
                  alt={galleryImages[selectedIndex].category}
                  className={`lightbox-premium-img ${isAnimating ? 'animating' : ''}`}
                  onError={() => handleImageError(selectedIndex)}
                />
              ) : (
                <div className="lightbox-fallback-premium">
                  <Camera size={64} />
                  <span>Image non disponible</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="lightbox-premium-footer">
              <p className="lightbox-premium-desc">
                {galleryImages[selectedIndex].description}
              </p>
              <div className="lightbox-premium-meta">
                <Clock size={14} />
                <span>Signature Restaurant</span>
              </div>
            </div>

            {/* Navigation */}
            <button 
              className="lightbox-premium-nav prev"
              onClick={() => navigateLightbox(-1)}
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              className="lightbox-premium-nav next"
              onClick={() => navigateLightbox(1)}
            >
              <ChevronRight size={32} />
            </button>

            {/* Progress */}
            <div className="lightbox-premium-progress">
              {galleryImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`progress-premium-bar ${idx === selectedIndex ? 'active' : ''}`}
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