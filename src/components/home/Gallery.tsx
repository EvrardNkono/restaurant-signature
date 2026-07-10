import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import './Gallery.css';

// ✅ Génère la liste des images (resto1.webp → resto4.webp)
const TOTAL_IMAGES = 4;

const galleryImages = Array.from({ length: TOTAL_IMAGES }, (_, i) => ({
  src: `/images/resto${i + 1}.webp`,
  index: i + 1,
  alt: `Restaurant Signature — photo ${i + 1}`,
}));

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [erroredImages, setErroredImages] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  // Préchargement des images
  useEffect(() => {
    galleryImages.forEach((img, idx) => {
      const image = new Image();
      image.onload = () => setLoadedImages(prev => new Set(prev).add(idx));
      image.onerror = () => setErroredImages(prev => new Set(prev).add(idx));
      image.src = img.src;
    });
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const navigate = useCallback((direction: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (lightboxIndex !== null) {
      setLightboxIndex(prev =>
        prev === null ? 0 : (prev + direction + TOTAL_IMAGES) % TOTAL_IMAGES
      );
    } else {
      setActiveIndex(prev => (prev + direction + TOTAL_IMAGES) % TOTAL_IMAGES);
    }
    setTimeout(() => setIsTransitioning(false), 260);
  }, [isTransitioning, lightboxIndex]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, navigate, closeLightbox]);

  const displayIndex = lightboxIndex ?? activeIndex;
  const current = galleryImages[displayIndex];

  return (
    <section className="gallery-section" ref={sectionRef}>
      <div className="gallery-heading">
        <span className="gallery-eyebrow">Galerie</span>
        <h2 className="gallery-title">L'atmosphère Signature</h2>
        <span className="gallery-rule" />
      </div>

      <div className="gallery-layout">
        {/* Image principale */}
        <figure
          className="gallery-focus"
          onClick={() => openLightbox(activeIndex)}
        >
          {!erroredImages.has(activeIndex) && loadedImages.has(activeIndex) ? (
            <img
              key={activeIndex}
              src={galleryImages[activeIndex].src}
              alt={galleryImages[activeIndex].alt}
              className="gallery-focus-img"
            />
          ) : (
            <div className="gallery-placeholder">
              <Camera size={28} strokeWidth={1.25} />
            </div>
          )}
          <span className="gallery-focus-veil" />
          <figcaption className="gallery-focus-caption">
            <span className="gallery-focus-index">
              {String(activeIndex + 1).padStart(2, '0')} / {String(TOTAL_IMAGES).padStart(2, '0')}
            </span>
            <span className="gallery-focus-label">Agrandir</span>
          </figcaption>
        </figure>

        {/* Bande de vignettes */}
        <div className="gallery-filmstrip">
          {galleryImages.map((image, idx) => (
            <button
              key={image.index}
              className={`gallery-thumb ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Voir la photo ${idx + 1}`}
              aria-current={idx === activeIndex}
            >
              {!erroredImages.has(idx) && loadedImages.has(idx) ? (
                <img src={image.src} alt={image.alt} loading="lazy" />
              ) : (
                <span className="gallery-thumb-placeholder">
                  <Camera size={16} strokeWidth={1.25} />
                </span>
              )}
              <span className="gallery-thumb-index">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <button className="gallery-lightbox-close" onClick={closeLightbox} aria-label="Fermer">
            <X size={20} strokeWidth={1.25} />
          </button>

          <button
            className="gallery-lightbox-nav prev"
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            aria-label="Photo précédente"
          >
            <ChevronLeft size={22} strokeWidth={1.25} />
          </button>

          <div className="gallery-lightbox-stage" onClick={(e) => e.stopPropagation()}>
            {!erroredImages.has(displayIndex) && loadedImages.has(displayIndex) ? (
              <img
                key={displayIndex}
                src={current.src}
                alt={current.alt}
                className={`gallery-lightbox-img ${isTransitioning ? 'is-transitioning' : ''}`}
              />
            ) : (
              <div className="gallery-placeholder large">
                <Camera size={40} strokeWidth={1.25} />
              </div>
            )}
            <div className="gallery-lightbox-footer">
              <span className="gallery-lightbox-index">
                {String(displayIndex + 1).padStart(2, '0')} — {String(TOTAL_IMAGES).padStart(2, '0')}
              </span>
            </div>
          </div>

          <button
            className="gallery-lightbox-nav next"
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            aria-label="Photo suivante"
          >
            <ChevronRight size={22} strokeWidth={1.25} />
          </button>
        </div>
      )}
    </section>
  );
}