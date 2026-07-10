import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import './Gallery.css';

// ✅ Génère la liste des images (resto1.webp → resto4.webp)
const TOTAL_IMAGES = 4;

const galleryImages = Array.from({ length: TOTAL_IMAGES }, (_, i) => ({
  src: `/images/resto${i + 1}.webp`,
  alt: `Restaurant Signature — cliché ${i + 1}`,
}));

const pad = (n: number) => String(n).padStart(2, '0');

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [erroredImages, setErroredImages] = useState<Set<number>>(new Set());

  // Préchargement
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
    setLightboxIndex(prev =>
      prev === null ? 0 : (prev + direction + TOTAL_IMAGES) % TOTAL_IMAGES
    );
  }, []);

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

  return (
    <section className="reel-section">
      <header className="reel-head">
        <span className="reel-eyebrow">Bobine N° 04 — Galerie</span>
        <h2 className="reel-title">Instants&nbsp;Signature</h2>
        <span className="reel-rule" />
      </header>

      <div className="reel-sprockets" aria-hidden="true" />

      <div className="reel-strip">
        {galleryImages.map((image, idx) => (
          <button
            key={idx}
            className="reel-frame"
            onClick={() => openLightbox(idx)}
            aria-label={`Agrandir le cliché ${idx + 1}`}
          >
            <span className="frame-number">{pad(idx + 1)}</span>

            <span className="frame-image-wrap">
              {!erroredImages.has(idx) && loadedImages.has(idx) ? (
                <img src={image.src} alt={image.alt} loading="lazy" />
              ) : (
                <span className="frame-placeholder">
                  <Camera size={22} strokeWidth={1.1} />
                </span>
              )}
            </span>

            <svg className="frame-mark" viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M50 8 C74 6, 93 24, 92 49 C91 75, 72 93, 48 92 C24 91, 7 71, 8 47 C9 24, 27 9, 50 8 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>

            <span className="frame-caption">Voir en grand</span>
          </button>
        ))}
      </div>

      <div className="reel-sprockets" aria-hidden="true" />

      {/* Visionneuse */}
      {lightboxIndex !== null && (
        <div className="reel-lightbox" onClick={closeLightbox}>
          <button className="reel-lb-close" onClick={closeLightbox} aria-label="Fermer">
            <X size={20} strokeWidth={1.25} />
          </button>

          <button
            className="reel-lb-nav prev"
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            aria-label="Cliché précédent"
          >
            <ChevronLeft size={26} strokeWidth={1.1} />
          </button>

          <div className="reel-lb-print" onClick={(e) => e.stopPropagation()}>
            <span className="reel-lb-framenum">{pad(lightboxIndex + 1)}</span>
            {!erroredImages.has(lightboxIndex) && loadedImages.has(lightboxIndex) ? (
              <img
                key={lightboxIndex}
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                className="reel-lb-img"
              />
            ) : (
              <div className="frame-placeholder large">
                <Camera size={36} strokeWidth={1.1} />
              </div>
            )}
          </div>

          <button
            className="reel-lb-nav next"
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            aria-label="Cliché suivant"
          >
            <ChevronRight size={26} strokeWidth={1.1} />
          </button>

          <div className="reel-lb-rail" onClick={(e) => e.stopPropagation()}>
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                className={`reel-lb-tick ${idx === lightboxIndex ? 'is-active' : ''}`}
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Aller au cliché ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}