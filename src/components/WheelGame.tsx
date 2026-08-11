import { useState, useEffect, useMemo, useCallback, useRef, useId } from "react";
import { X, Gift, Sparkles, RotateCcw, ChevronDown, Calendar, ExternalLink } from "lucide-react";
import "./WheelGame.css";

// Même lien que dans la Navbar — à garder synchronisé si le Place ID change.
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJC5K8D1L75UcRLFLJMr2OF14";
const REVIEW_CONFIRMED_KEY = "wheel_review_confirmed";

// Icône Google officielle (4 couleurs), en SVG inline.
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

// ============================================================
// CONFIGURATION DES RÉCOMPENSES
// ============================================================
interface Reward {
  id: string;
  label: string;
  emoji: string;
  color: string;
  probability: number; // poids relatif à l'intérieur de son palier (tier)
  description: string;
  tier: "common" | "rare" | "legendary";
}

const REWARDS: Reward[] = [
  { id: "canette-1", label: "Canette de jus", emoji: "🥤", color: "#4FC3F7", probability: 30, description: "Une canette de jus frais offerte", tier: "common" },
  { id: "accompagnement-1", label: "Accompagnement offert", emoji: "🍚", color: "#81C784", probability: 25, description: "Un accompagnement au choix offert", tier: "common" },
  { id: "supplement-1", label: "Supplément offert", emoji: "🧂", color: "#FFD54F", probability: 20, description: "Un supplément au choix offert", tier: "common" },
  { id: "ailes-1", label: "Ailes de poulet", emoji: "🍗", color: "#FF8A65", probability: 15, description: "6 ailes de poulet offertes", tier: "common" },
  { id: "mafe-1", label: "Mafé Poulet", emoji: "🍛", color: "#FF6B35", probability: 1, description: "Un délicieux Mafé Poulet offert", tier: "rare" },
  { id: "yassa-1", label: "Yassa Poulet", emoji: "🍋", color: "#66BB6A", probability: 1, description: "Un Yassa Poulet parfumé offert", tier: "rare" },
  { id: "tchiep-1", label: "Tchiep Poulet", emoji: "🍲", color: "#AB47BC", probability: 1, description: "Un Tchiep Poulet traditionnel offert", tier: "rare" },
  { id: "brochette-1", label: "Brochettes viande", emoji: "🥩", color: "#EF5350", probability: 1, description: "4 brochettes de viande offertes", tier: "rare" },
  { id: "tilapia-1", label: "Tilapia frit", emoji: "🐟", color: "#42A5F5", probability: 1, description: "Un Tilapia frit croustillant offert", tier: "rare" },
  { id: "reduction-20", label: "-20€ sur la note", emoji: "💰", color: "#FFD700", probability: 1, description: "20€ de réduction sur votre addition", tier: "legendary" },
];

const NUM_SEGMENTS = REWARDS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
const CENTER = 150;
const RADIUS = 140;

// Paliers de la mécanique de tirage (pity system lisible)
const WARMUP_SPINS = 20; // avant ce seuil : que du commun
const LEGENDARY_UNLOCK = 50; // avant ce seuil : pas de légendaire possible
const RARE_CHANCE = 0.05; // 5% une fois le palier "warmup" passé
const LEGENDARY_CHANCE = 0.001; // 0.1% une fois le palier légendaire passé

// ==================== HELPERS GÉOMÉTRIE (calculés une seule fois, pas par frame) ====================
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeSegmentPath(index: number) {
  const start = index * SEGMENT_ANGLE;
  const end = start + SEGMENT_ANGLE;
  const p1 = polarToCartesian(CENTER, CENTER, RADIUS, start);
  const p2 = polarToCartesian(CENTER, CENTER, RADIUS, end);
  const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
}

// ==================== TIRAGE PONDÉRÉ ====================
function pickWeighted(pool: Reward[]): Reward {
  const total = pool.reduce((sum, r) => sum + r.probability, 0);
  let roll = Math.random() * total;
  for (const reward of pool) {
    if (roll < reward.probability) return reward;
    roll -= reward.probability;
  }
  return pool[pool.length - 1];
}

const COMMON_POOL = REWARDS.filter((r) => r.tier === "common");
const RARE_POOL = REWARDS.filter((r) => r.tier === "rare");
const LEGENDARY_POOL = REWARDS.filter((r) => r.tier === "legendary");

function getRandomReward(spinCount: number, isTestMode: boolean): Reward {
  if (isTestMode) {
    const roll = Math.random();
    if (roll < 0.05) return pickWeighted(LEGENDARY_POOL);
    if (roll < 0.2) return pickWeighted(RARE_POOL);
    return pickWeighted(COMMON_POOL);
  }

  if (spinCount < WARMUP_SPINS) return pickWeighted(COMMON_POOL);

  const roll = Math.random();
  if (spinCount >= LEGENDARY_UNLOCK && roll < LEGENDARY_CHANCE) return pickWeighted(LEGENDARY_POOL);
  if (roll < RARE_CHANCE) return pickWeighted(RARE_POOL);
  return pickWeighted(COMMON_POOL);
}

// ==================== CONFETTIS (CSS pur, pas de boucle JS) ====================
interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  color: string;
}

const CONFETTI_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6BFF", "#D4AF37", "#F5E6A3"];

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 2.4 + Math.random() * 1.4,
    drift: (Math.random() - 0.5) * 80,
    size: 5 + Math.random() * 5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }));
}

// ==================== COMPOSANT PRINCIPAL ====================
interface WheelGameProps {
  isOpen: boolean;
  onClose: () => void;
  onWin?: (reward: Reward) => void;
  isTestMode?: boolean;
}

export default function WheelGame({ isOpen, onClose, onWin, isTestMode = false }: WheelGameProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [canSpin, setCanSpin] = useState(true);
  const [nextSpinDate, setNextSpinDate] = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ==================== PALIER "AVIS GOOGLE" ====================
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [hasOpenedReviewLink, setHasOpenedReviewLink] = useState(false);

  const resultHeadingId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<SVGGElement>(null);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRewardRef = useRef<Reward | null>(null);

  // ==================== PRÉFÉRENCE "MOUVEMENT RÉDUIT" ====================
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  // ==================== VÉRIFICATION DU TOUR DISPONIBLE ====================
  const checkAvailability = useCallback(() => {
    if (isTestMode) {
      setCanSpin(true);
      return;
    }

    const lastSpin = localStorage.getItem("wheel_last_spin");
    const today = new Date().toDateString();
    const count = parseInt(localStorage.getItem("wheel_spin_count") || "0", 10);
    setSpinCount(count);

    if (lastSpin === today) {
      setCanSpin(false);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      setNextSpinDate(nextDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
    } else {
      setCanSpin(true);
    }
  }, [isTestMode]);

  useEffect(() => {
    if (isOpen) checkAvailability();
  }, [isOpen, checkAvailability]);

  useEffect(() => {
    if (isOpen && !isTestMode) {
      setReviewConfirmed(localStorage.getItem(REVIEW_CONFIRMED_KEY) === "true");
    }
    if (isOpen && isTestMode) {
      setReviewConfirmed(true); // pas de blocage en mode test
    }
  }, [isOpen, isTestMode]);

  const openReviewLink = () => {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    setHasOpenedReviewLink(true);
  };

  const confirmReview = () => {
    localStorage.setItem(REVIEW_CONFIRMED_KEY, "true");
    setReviewConfirmed(true);
  };

  // ==================== INDICATION DE SCROLL (à chaque ouverture) ====================
  // Léger scroll vers le bas puis retour en haut, pour montrer qu'il y a du contenu
  // à découvrir plus bas dans la modale.
  const scrollTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    scrollTimersRef.current.forEach(clearTimeout);
    scrollTimersRef.current = [];

    if (!isOpen || prefersReducedMotion) return;

    const t1 = setTimeout(() => {
      const modal = modalRef.current;
      if (!modal) return;
      modal.scrollTo({ top: 130, behavior: "smooth" });

      const t2 = setTimeout(() => {
        modal.scrollTo({ top: 0, behavior: "smooth" });
      }, 750);
      scrollTimersRef.current.push(t2);
    }, 450);
    scrollTimersRef.current.push(t1);

    return () => {
      scrollTimersRef.current.forEach(clearTimeout);
      scrollTimersRef.current = [];
    };
  }, [isOpen, prefersReducedMotion]);

  // ==================== FERMER AVEC ÉCHAP ====================
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // ==================== SEGMENTS DE LA ROUE (calculés une seule fois) ====================
  const segments = useMemo(
    () =>
      REWARDS.map((reward, index) => {
        const midAngle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
        const labelPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.68, midAngle);
        return {
          reward,
          path: describeSegmentPath(index),
          midAngle,
          labelPos,
        };
      }),
    []
  );

  // ==================== LANCER LA ROUE ====================
  const spinWheel = useCallback(() => {
    if (isSpinning || hasSpun || !canSpin) return;

    if (!isTestMode) {
      localStorage.setItem("wheel_last_spin", new Date().toDateString());
    }

    const newSpinCount = spinCount + 1;
    if (!isTestMode) {
      localStorage.setItem("wheel_spin_count", String(newSpinCount));
    }
    setSpinCount(newSpinCount);

    const reward = getRandomReward(newSpinCount, isTestMode);
    pendingRewardRef.current = reward;

    const rewardIndex = REWARDS.findIndex((r) => r.id === reward.id);
    const targetMidAngle = rewardIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    // Le pointeur est fixe en haut : on veut que targetMidAngle atterrisse à 0° (haut) après rotation.
    const desiredFinalMod = ((-targetMidAngle % 360) + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const diff = ((desiredFinalMod - currentMod + 360) % 360);
    const extraSpins = prefersReducedMotion ? 1 : 5 + Math.floor(Math.random() * 4);
    const newRotation = rotation + extraSpins * 360 + diff;

    setIsSpinning(true);
    setSelectedReward(null);
    setShowResult(false);
    setConfetti([]);
    setRotation(newRotation);
  }, [isSpinning, hasSpun, canSpin, isTestMode, spinCount, rotation, prefersReducedMotion]);

  // ==================== FIN DE ROTATION (déclenché par le navigateur, pas par du JS par frame) ====================
  const handleTransitionEnd = useCallback(() => {
    if (!isSpinning) return;
    const reward = pendingRewardRef.current;
    setIsSpinning(false);
    setHasSpun(true);
    if (!reward) return;
    setSelectedReward(reward);
    setShowResult(true);

    if (reward.tier === "rare" || reward.tier === "legendary") {
      setConfetti(makeConfetti(reward.tier === "legendary" ? 60 : 36));
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = setTimeout(() => setConfetti([]), 3600);
    }

    if (onWin) onWin(reward);
  }, [isSpinning, onWin]);

  useEffect(() => () => {
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
  }, []);

  // ==================== RÉINITIALISER (mode test uniquement) ====================
  const resetGame = () => {
    setHasSpun(false);
    setSelectedReward(null);
    setShowResult(false);
    setConfetti([]);
    checkAvailability();
  };

  if (!isOpen) return null;

  const statusLabel = !canSpin ? "⏳ Attente" : hasSpun ? "✅ Joué" : "🎯 Prêt";
  const statusColor = hasSpun ? "#9a9a9a" : canSpin ? "#4ade80" : "#f87171";

  return (
    <div className="wheel-game-overlay" onClick={onClose}>
      <div
        className="wheel-game-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wheel-game-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="wheel-game-header">
          <div className="header-icon" aria-hidden="true">
            <Gift size={22} color="#D4AF37" />
          </div>
          <h2 id="wheel-game-title">Tentez votre chance</h2>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {isTestMode && (
          <div className="test-mode-badge">
            <span>🧪 Mode test</span>
            <span className="test-hint">Tours illimités · rareté augmentée</span>
          </div>
        )}

        {!reviewConfirmed ? (
          <div className="review-gate">
            <div className="review-gate-icon" aria-hidden="true">
              <GoogleIcon size={36} />
            </div>
            <h3>Un avis Google avant de jouer</h3>
            <p className="review-gate-cta-line">🌟 Laissez un avis avant de tourner la roue !</p>
            <p>
              Cette roue est notre façon de vous remercier. Laissez-nous d'abord un petit avis sur
              Google, ça nous aide énormément — puis revenez ici pour tourner la roue.
            </p>
            <button className="review-gate-btn" onClick={openReviewLink}>
              <GoogleIcon size={18} />
              <span>Laisser un avis Google</span>
              <ExternalLink size={14} />
            </button>
            <button
              className={`review-confirm-btn ${!hasOpenedReviewLink ? "disabled" : ""}`}
              onClick={confirmReview}
              disabled={!hasOpenedReviewLink}
            >
              J'ai laissé mon avis, débloquer la roue
            </button>
            {!hasOpenedReviewLink && (
              <p className="review-gate-hint">Ouvrez d'abord le lien ci-dessus pour débloquer ce bouton.</p>
            )}
          </div>
        ) : !canSpin && !isTestMode && (
          <div className="waiting-banner">
            <Calendar size={16} />
            <span>
              Prochain tour disponible le <strong>{nextSpinDate}</strong>
            </span>
          </div>
        )}

        {reviewConfirmed && (
        <>
        {!hasSpun && !showResult && canSpin && (
          <div className="scroll-indicator" aria-hidden="true">
            <ChevronDown size={16} className="scroll-chevron" />
            <span>Découvrez les récompenses</span>
          </div>
        )}

        {/* STATS */}
        <div className="wheel-stats">
          <div className="stat-item">
            <span className="stat-label">Statut</span>
            <span className="stat-value" style={{ fontSize: "0.95rem", color: statusColor }}>
              {statusLabel}
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">Tentatives</span>
            <span className="stat-value">{spinCount}</span>
          </div>
        </div>

        {/* ROUE SVG */}
        <div className="wheel-container">
          <div className="wheel-wrapper">
            <div className="wheel-pointer" aria-hidden="true">
              <div className="pointer-triangle" />
              <div className="pointer-dot" />
            </div>

            <svg
              viewBox="0 0 300 300"
              className="wheel-svg"
              role="img"
              aria-label="Roue de récompenses"
            >
              <defs>
                <radialGradient id="hubGradient" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="55%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8B6914" />
                </radialGradient>
              </defs>

              <g
                ref={wheelRef}
                className="wheel-rotor"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? (prefersReducedMotion ? "0.6s" : `${4.6 + (rotation % 3) * 0.1}s`) : "0s",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {segments.map(({ reward, path, midAngle, labelPos }) => (
                  <g key={reward.id}>
                    <path d={path} fill={reward.color} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      transform={`rotate(${midAngle} ${labelPos.x} ${labelPos.y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="22"
                      className="wheel-emoji"
                    >
                      {reward.emoji}
                    </text>
                    {reward.tier !== "common" && (
                      <text
                        x={labelPos.x}
                        y={labelPos.y + 18}
                        transform={`rotate(${midAngle} ${labelPos.x} ${labelPos.y + 18})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9"
                        fill="#fff"
                        className="wheel-tier-mark"
                      >
                        {reward.tier === "legendary" ? "⭐" : "✦"}
                      </text>
                    )}
                  </g>
                ))}
              </g>

              <circle cx={CENTER} cy={CENTER} r="48" fill="url(#hubGradient)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              <text x={CENTER} y={CENTER - 6} textAnchor="middle" className="hub-title">
                Signature
              </text>
              <text x={CENTER} y={CENTER + 14} textAnchor="middle" className="hub-subtitle">
                ✨ Tourne ✨
              </text>
            </svg>

            {/* CONFETTIS CSS */}
            {confetti.length > 0 && (
              <div className="confetti-layer" aria-hidden="true">
                {confetti.map((c) => (
                  <span
                    key={c.id}
                    className="confetti-piece"
                    style={{
                      left: `${c.left}%`,
                      width: c.size,
                      height: c.size * 1.5,
                      backgroundColor: c.color,
                      animationDelay: `${c.delay}s`,
                      animationDuration: `${c.duration}s`,
                      // @ts-ignore custom property for drift
                      "--drift": `${c.drift}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOUTON LANCER */}
        <button
          className={`spin-btn ${isSpinning ? "spinning" : ""} ${hasSpun || !canSpin ? "disabled" : ""}`}
          onClick={spinWheel}
          disabled={isSpinning || hasSpun || !canSpin}
        >
          {!canSpin && !isTestMode ? (
            <>
              <Calendar size={18} />
              <span>Attendez le prochain tour</span>
            </>
          ) : isSpinning ? (
            <span>La roue tourne…</span>
          ) : hasSpun ? (
            <>
              <RotateCcw size={18} />
              <span>{isTestMode ? "Rejouer" : "Tour terminé"}</span>
            </>
          ) : (
            <>
              <Gift size={18} />
              <span>Faire tourner</span>
            </>
          )}
        </button>

        {/* RÉSULTAT */}
        <div aria-live="polite">
          {showResult && selectedReward && (
            <div className={`wheel-result ${selectedReward.tier === "legendary" ? "legendary-result" : ""}`}>
              <div className={`result-card tier-${selectedReward.tier}`} style={{ borderColor: selectedReward.color }}>
                <div className="result-icon" style={{ background: selectedReward.color }} aria-hidden="true">
                  {selectedReward.emoji}
                </div>
                <div className="result-content">
                  <h4 id={resultHeadingId}>Gagné : {selectedReward.label}</h4>
                  <p>{selectedReward.description}</p>
                  <div className="result-badge">
                    {selectedReward.tier === "legendary" && "👑 "}
                    {selectedReward.tier === "rare" && "⭐ "}
                    <Sparkles size={12} />
                    <span>Récompense débloquée</span>
                  </div>
                </div>
              </div>
              <p className="claim-reminder">
                📌 Assurez-vous d'avoir laissé votre avis pour réclamer votre récompense, cher client !
              </p>
            </div>
          )}
        </div>

        {isTestMode && hasSpun && (
          <button className="reset-btn" onClick={resetGame}>
            <RotateCcw size={16} />
            <span>Nouveau test</span>
          </button>
        )}

        {/* LISTE DES RÉCOMPENSES */}
        <div className="rewards-list">
          <div className="rewards-header">
            <h4>Récompenses possibles</h4>
            <span className="rewards-badge">
              <Sparkles size={12} />
              {REWARDS.length} gains
            </span>
          </div>
          <div className="rewards-grid">
            <div className="reward-group-label">Courantes</div>
            {COMMON_POOL.map((reward) => (
              <div key={reward.id} className="reward-item">
                <span className="reward-emoji" aria-hidden="true">{reward.emoji}</span>
                <span className="reward-name">{reward.label}</span>
              </div>
            ))}

            <div className="reward-group-label">Rares</div>
            {RARE_POOL.map((reward) => (
              <div key={reward.id} className="reward-item rare">
                <span className="reward-emoji" aria-hidden="true">{reward.emoji}</span>
                <span className="reward-name">{reward.label}</span>
              </div>
            ))}

            <div className="reward-group-label">Légendaire</div>
            {LEGENDARY_POOL.map((reward) => (
              <div key={reward.id} className="reward-item legendary">
                <span className="reward-emoji" aria-hidden="true">{reward.emoji}</span>
                <span className="reward-name">{reward.label}</span>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}