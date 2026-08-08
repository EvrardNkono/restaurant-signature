import { useState, useEffect } from "react";
import { Gift, Zap, Crown } from "lucide-react";
import "./FloatingWheelButton.css";

interface FloatingWheelButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export default function FloatingWheelButton({ onClick, isActive = true }: FloatingWheelButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!isActive) return null;

  return (
    <>
      <div className="floating-wheel-explosive">
        {/* Rayon lumineux pulsant */}
        <div className="explosive-light-rays">
          <div className="ray ray-1"></div>
          <div className="ray ray-2"></div>
          <div className="ray ray-3"></div>
          <div className="ray ray-4"></div>
          <div className="ray ray-5"></div>
          <div className="ray ray-6"></div>
        </div>

        {/* Cercle de particules tournantes */}
        <div className="explosive-orbital-ring">
          <div className="orbital-particle" style={{ animationDelay: '0s' }}>✦</div>
          <div className="orbital-particle" style={{ animationDelay: '0.5s' }}>✦</div>
          <div className="orbital-particle" style={{ animationDelay: '1s' }}>✦</div>
          <div className="orbital-particle" style={{ animationDelay: '1.5s' }}>✦</div>
          <div className="orbital-particle" style={{ animationDelay: '2s' }}>✦</div>
          <div className="orbital-particle" style={{ animationDelay: '2.5s' }}>✦</div>
        </div>

        {/* Bouton principal */}
        <button
          className={`explosive-btn ${isHovered ? 'hovered' : ''} ${isGlowing ? 'glowing' : ''}`}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Jeu de la roue - Gagnez des récompenses"
        >
          {/* Fond avec effet 3D */}
          <div className="btn-3d-background">
            <div className="btn-3d-layer layer-1"></div>
            <div className="btn-3d-layer layer-2"></div>
            <div className="btn-3d-layer layer-3"></div>
          </div>

          {/* Effet de flammes */}
          <div className="btn-flame-effects">
            <div className="flame flame-1"></div>
            <div className="flame flame-2"></div>
            <div className="flame flame-3"></div>
          </div>

          {/* Contenu */}
          <div className="btn-content">
            {/* Icône géante */}
            <div className="btn-icon-explosive">
              <Gift size={32} className="icon-gift" />
              <div className="icon-explosion"></div>
              <div className="icon-sparkle-ring">
                <Zap size={12} className="icon-zap" />
              </div>
            </div>

            {/* Texte en 3D */}
            <div className="btn-text-explosive">
              <span className="text-main">
                <span className="text-gradient">🎡</span> TENTEZ
              </span>
              <span className="text-main gold">
                VOTRE CHANCE
              </span>
              <span className="text-sub">
                ⚡ Gagnez des plats offerts ⚡
              </span>
            </div>

            {/* Badge explosif */}
            <div className="btn-badge-explosive">
              <Crown size={10} />
              <span>GRATUIT</span>
              <div className="badge-explosion"></div>
            </div>
          </div>

          {/* Effet de survol */}
          <div className="btn-hover-effect">
            <div className="hover-wave"></div>
          </div>

          {/* Compteur de tours */}
          <div className="btn-counter">
            <span className="counter-number">1</span>
            <span className="counter-label">TOUR</span>
          </div>
        </button>

        {/* Texte flottant autour */}
        <div className="floating-texts">
          <span className="float-text t1">🎁</span>
          <span className="float-text t2">⭐</span>
          <span className="float-text t3">🔥</span>
          <span className="float-text t4">💎</span>
        </div>
      </div>
    </>
  );
}