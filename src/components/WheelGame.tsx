import { useState, useEffect, useCallback, useRef } from "react";
import { X, Gift, Sparkles, RotateCcw, ChevronDown, Calendar } from "lucide-react";
import "./WheelGame.css";

// ==================== CONFIGURATION DES RÉCOMPENSES ====================
interface Reward {
  id: string;
  label: string;
  emoji: string;
  color: string;
  probability: number;
  description: string;
  tier: "common" | "rare" | "legendary";
}

const REWARDS: Reward[] = [
  // ===== COMMUNES (probabilité élevée) =====
  {
    id: "canette-1",
    label: "Canette de jus",
    emoji: "🥤",
    color: "#4FC3F7",
    probability: 30,
    description: "Une canette de jus frais offerte",
    tier: "common"
  },
  {
    id: "accompagnement-1",
    label: "Accompagnement offert",
    emoji: "🍚",
    color: "#81C784",
    probability: 25,
    description: "Un accompagnement au choix offert",
    tier: "common"
  },
  {
    id: "supplement-1",
    label: "Supplément offert",
    emoji: "🧂",
    color: "#FFD54F",
    probability: 20,
    description: "Un supplément au choix offert",
    tier: "common"
  },
  {
    id: "ailes-1",
    label: "Ailes de poulet",
    emoji: "🍗",
    color: "#FF8A65",
    probability: 15,
    description: "6 ailes de poulet offertes",
    tier: "common"
  },
  
  // ===== RARES (1% - strictement contrôlé) =====
  {
    id: "mafe-1",
    label: "Mafé Poulet",
    emoji: "🍛",
    color: "#FF6B35",
    probability: 1,
    description: "Un délicieux Mafé Poulet offert",
    tier: "rare"
  },
  {
    id: "yassa-1",
    label: "Yassa Poulet",
    emoji: "🍋",
    color: "#66BB6A",
    probability: 1,
    description: "Un Yassa Poulet parfumé offert",
    tier: "rare"
  },
  {
    id: "tchiep-1",
    label: "Tchiep Poulet",
    emoji: "🍲",
    color: "#AB47BC",
    probability: 1,
    description: "Un Tchiep Poulet traditionnel offert",
    tier: "rare"
  },
  {
    id: "brochette-1",
    label: "Brochettes viande",
    emoji: "🥩",
    color: "#EF5350",
    probability: 1,
    description: "4 brochettes de viande offertes",
    tier: "rare"
  },
  {
    id: "tilapia-1",
    label: "Tilapia frit",
    emoji: "🐟",
    color: "#42A5F5",
    probability: 1,
    description: "Un Tilapia frit croustillant offert",
    tier: "rare"
  },
  
  // ===== LÉGENDAIRE (0.1% - ultra rare) =====
  {
    id: "reduction-20",
    label: "-20€ sur la note",
    emoji: "💰",
    color: "#FFD700",
    probability: 0.1,
    description: "20€ de réduction sur votre addition",
    tier: "legendary"
  }
];

// ==================== COMPOSANT PRINCIPAL ====================
interface WheelGameProps {
  isOpen: boolean;
  onClose: () => void;
  onWin?: (reward: Reward) => void;
  isTestMode?: boolean; // ✅ NOUVEAU : mode test
}

export default function WheelGame({ isOpen, onClose, onWin, isTestMode = false }: WheelGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; size: number; velocity: number; angle: number }[]>([]);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [nextSpinDate, setNextSpinDate] = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ==================== VÉRIFICATION DU TOUR MENSUEL ====================
  const checkMonthlySpin = useCallback(() => {
    // ✅ EN MODE TEST : toujours autorisé
    if (isTestMode) {
      setCanSpin(true);
      return true;
    }

    const lastSpin = localStorage.getItem('wheel_last_spin');
    const today = new Date().toDateString();
    
    if (lastSpin === today) {
      setCanSpin(false);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      setNextSpinDate(nextDate.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric' 
      }));
      return false;
    }
    
    const count = parseInt(localStorage.getItem('wheel_spin_count') || '0');
    setSpinCount(count);
    
    return true;
  }, [isTestMode]);

  // ==================== SÉLECTION DU GAIN AVEC RARETÉ GARANTIE ====================
  const getRandomReward = useCallback((): Reward => {
    const commonRewards = REWARDS.filter(r => r.tier === "common");
    const rareRewards = REWARDS.filter(r => r.tier === "rare");
    const legendaryRewards = REWARDS.filter(r => r.tier === "legendary");
    
    const spinCount = parseInt(localStorage.getItem('wheel_spin_count') || '0');
    const newSpinCount = spinCount + 1;
    
    // ✅ EN MODE TEST : probabilités boostées pour tester
    if (isTestMode) {
      const random = Math.random() * 100;
      
      // 5% de chance légendaire en test (au lieu de 0.1%)
      if (random < 5) {
        return legendaryRewards[Math.floor(Math.random() * legendaryRewards.length)];
      }
      
      // 15% de chance rare en test (au lieu de 1-2%)
      if (random < 15) {
        return rareRewards[Math.floor(Math.random() * rareRewards.length)];
      }
      
      return commonRewards[Math.floor(Math.random() * commonRewards.length)];
    }
    
    // 🔒 MODE PRODUCTION : rareté garantie
    localStorage.setItem('wheel_spin_count', String(newSpinCount));
    setSpinCount(newSpinCount);
    
    if (newSpinCount < 50) {
      if (newSpinCount < 20) {
        return commonRewards[Math.floor(Math.random() * commonRewards.length)];
      } else {
        const rareChance = Math.random() * 100;
        if (rareChance < 5) {
          return rareRewards[Math.floor(Math.random() * rareRewards.length)];
        }
        return commonRewards[Math.floor(Math.random() * commonRewards.length)];
      }
    }
    
    const random = Math.random() * 100;
    
    if (random < 0.1 && newSpinCount > 50) {
      return legendaryRewards[Math.floor(Math.random() * legendaryRewards.length)];
    }
    
    if (random < 2) {
      return rareRewards[Math.floor(Math.random() * rareRewards.length)];
    }
    
    return commonRewards[Math.floor(Math.random() * commonRewards.length)];
  }, [isTestMode]);

  // ==================== AUTO-SCROLL À L'OUVERTURE ====================
  useEffect(() => {
    if (isOpen) {
      const canPlay = checkMonthlySpin();
      setCanSpin(canPlay);
      
      if (!hasAutoScrolled) {
        setHasAutoScrolled(true);
        setTimeout(() => {
          const modal = modalRef.current;
          if (modal) {
            modal.scrollTo({
              top: modal.scrollHeight,
              behavior: 'smooth'
            });
            setTimeout(() => {
              modal.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }, 1500);
          }
        }, 500);
      }
    }
  }, [isOpen, checkMonthlySpin, hasAutoScrolled]);

  // ==================== DESSIN DE LA ROUE ====================
  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const numSegments = REWARDS.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, width, height);

    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    REWARDS.forEach((reward, index) => {
      const startAngle = (index * anglePerSegment) + rotation;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, reward.color);
      gradient.addColorStop(1, reward.color);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = '28px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(reward.emoji, radius * 0.7, -12);

      ctx.font = '8px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      const tierLabel = reward.tier === 'legendary' ? '⭐' : reward.tier === 'rare' ? '✦' : '';
      ctx.fillText(tierLabel, radius * 0.7, 30);
      ctx.shadowBlur = 0;

      ctx.restore();
    });

    ctx.shadowColor = 'rgba(212,175,55,0.5)';
    ctx.shadowBlur = 40;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 55);
    gradient.addColorStop(0, '#FFE082');
    gradient.addColorStop(0.5, '#D4AF37');
    gradient.addColorStop(1, '#8B6914');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 15px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 5;
    ctx.fillText('Signature', centerX, centerY - 6);
    ctx.font = '8px sans-serif';
    ctx.fillText('✨ Tourne ✨', centerX, centerY + 16);
    ctx.shadowBlur = 0;
  }, [rotation]);

  // ==================== CONFETTIS ====================
  const generateConfetti = () => {
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BFF', '#D4AF37', '#F5E6A3'];
    const newConfetti = [];
    for (let i = 0; i < 80; i++) {
      newConfetti.push({
        x: Math.random() * 100,
        y: Math.random() * 100 - 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        velocity: 2 + Math.random() * 4,
        angle: Math.random() * 360
      });
    }
    setConfetti(newConfetti);
  };

  // ==================== LANCER LA ROUE ====================
  const spinWheel = useCallback(() => {
    if (isSpinning || hasSpun || !canSpin) return;

    // ✅ EN MODE TEST : on n'enregistre pas le spin
    if (!isTestMode) {
      const today = new Date().toDateString();
      localStorage.setItem('wheel_last_spin', today);
    }

    setIsSpinning(true);
    setSelectedReward(null);
    setShowResult(false);
    setConfetti([]);

    const reward = getRandomReward();
    setSelectedReward(reward);

    const numSegments = REWARDS.length;
    const rewardIndex = REWARDS.findIndex(r => r.id === reward.id);
    const anglePerSegment = (2 * Math.PI) / numSegments;
    
    const targetAngle = -Math.PI / 2 - (rewardIndex * anglePerSegment) - anglePerSegment / 2;
    
    const spins = 5 + Math.floor(Math.random() * 5);
    const totalRotation = (spins * 2 * Math.PI) + targetAngle;
    
    const startRotation = rotation;
    const endRotation = startRotation + totalRotation;
    const duration = 4500 + Math.random() * 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);
      
      const currentRotation = startRotation + (endRotation - startRotation) * easedProgress;
      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(endRotation);
        setIsSpinning(false);
        setShowResult(true);
        setHasSpun(true);
        
        if (reward.tier === 'rare' || reward.tier === 'legendary') {
          generateConfetti();
        }
        
        if (onWin) onWin(reward);
      }
    };

    animate();
  }, [isSpinning, hasSpun, canSpin, rotation, getRandomReward, onWin, isTestMode]);

  // ==================== RÉINITIALISER ====================
  const resetGame = () => {
    setHasSpun(false);
    setSelectedReward(null);
    setShowResult(false);
    setRotation(0);
    setConfetti([]);
    setHasAutoScrolled(false);
    
    // ✅ EN MODE TEST : on recharge la vérification
    if (isTestMode) {
      setCanSpin(true);
    } else {
      checkMonthlySpin();
    }
  };

  // ==================== RENDER CANVAS ====================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    const size = Math.min(rect?.width || 500, 500);
    canvas.width = size;
    canvas.height = size;

    drawWheel(ctx, size, size);
  }, [rotation, drawWheel]);

  // ==================== REDIMENSIONNEMENT ====================
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      const size = Math.min(rect?.width || 500, 500);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) drawWheel(ctx, size, size);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWheel]);

  // ==================== ANIMATION CONFETTIS ====================
  useEffect(() => {
    if (confetti.length === 0) return;

    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = rect?.width || 560;
    canvas.height = rect?.height || 500;

    let frameId: number;

    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      confetti.forEach((c) => {
        c.y += c.velocity;
        c.x += Math.sin(c.angle * Math.PI / 180) * 0.5;
        c.angle += 2;

        if (c.y > canvas.height + 20) {
          c.y = -10;
          c.x = Math.random() * 100;
        }

        ctx.save();
        ctx.translate(c.x * canvas.width / 100, c.y);
        ctx.rotate(c.angle * Math.PI / 180);
        ctx.fillStyle = c.color;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 5;
        ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size * 1.5);
        ctx.restore();
      });

      frameId = requestAnimationFrame(animateConfetti);
    };

    animateConfetti();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [confetti]);

  // ==================== NETTOYAGE ====================
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ==================== RENDU ====================
  if (!isOpen) return null;

  return (
    <div className="wheel-game-overlay" onClick={onClose}>
      <div className="wheel-game-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* CONFETTIS */}
        {showResult && confetti.length > 0 && (
          <canvas id="confetti-canvas" className="confetti-canvas" />
        )}

        {/* HEADER */}
        <div className="wheel-game-header">
          <div className="header-icon">
            <Gift size={24} color="#D4AF37" />
          </div>
          <h2>🎯 Tentez votre chance !</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ✅ BADGE MODE TEST */}
        {isTestMode && (
          <div className="test-mode-badge">
            <span>🧪 MODE TEST</span>
            <span className="test-hint">Tours illimités - Rareté réduite</span>
          </div>
        )}

        {/* BANNIÈRE D'ATTENTE */}
        {!canSpin && !isTestMode && (
          <div className="waiting-banner">
            <Calendar size={18} />
            <span>Prochain tour disponible le <strong>{nextSpinDate}</strong></span>
          </div>
        )}

        {/* INDICATEUR DE SCROLL */}
        {!hasSpun && !showResult && canSpin && (
          <div className="scroll-indicator">
            <div className="scroll-hint">
              <ChevronDown size={20} className="scroll-chevron" />
              <span>Découvrez les récompenses</span>
              <ChevronDown size={20} className="scroll-chevron" />
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="wheel-stats">
          <div className="stat-item">
            <span className="stat-label">Statut</span>
            <span className="stat-value" style={{ fontSize: '1rem', color: hasSpun ? '#888' : canSpin ? '#4ade80' : '#f87171' }}>
              {!canSpin ? '⏳ Attente' : hasSpun ? '✅ Joué' : '🎯 Prêt'}
            </span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Tour</span>
            <span className="stat-value">{hasSpun ? '0' : '1'}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Tentatives</span>
            <span className="stat-value" style={{ fontSize: '1rem' }}>{spinCount}</span>
          </div>
        </div>

        {/* ROUE */}
        <div className="wheel-container">
          <div className="wheel-wrapper">
            <canvas ref={canvasRef} className="wheel-canvas" />
            <div className="wheel-pointer">
              <div className="pointer-triangle"></div>
              <div className="pointer-dot"></div>
            </div>
            <div className="wheel-center-decoration">
              <Sparkles size={20} color="#D4AF37" />
            </div>
          </div>
        </div>

        {/* BOUTON LANCER */}
        <button 
          className={`spin-btn ${isSpinning ? 'spinning' : ''} ${(hasSpun || !canSpin) ? 'disabled' : ''}`}
          onClick={spinWheel}
          disabled={isSpinning || hasSpun || !canSpin}
        >
          {!canSpin && !isTestMode ? (
            <>
              <Calendar size={18} />
              <span>Attendez le prochain tour</span>
            </>
          ) : isSpinning ? (
            <>
              <span className="spinner-dot"></span>
              <span className="spinner-dot"></span>
              <span className="spinner-dot"></span>
              <span>En cours...</span>
            </>
          ) : hasSpun ? (
            <>
              <RotateCcw size={18} />
              <span>{isTestMode ? '🔁 Rejouer' : 'Tour terminé'}</span>
            </>
          ) : (
            <>
              <Gift size={18} />
              <span>Faire tourner</span>
            </>
          )}
        </button>

        {/* RÉSULTAT */}
        {showResult && selectedReward && (
          <div className={`wheel-result ${selectedReward.tier === 'legendary' ? 'legendary-result' : ''}`}>
            <div className={`result-card tier-${selectedReward.tier}`} style={{ borderColor: selectedReward.color }}>
              <div className="result-icon" style={{ background: selectedReward.color }}>
                {selectedReward.emoji}
              </div>
              <div className="result-content">
                <h4>🎉 {selectedReward.label}</h4>
                <p>{selectedReward.description}</p>
                <div className="result-badge">
                  {selectedReward.tier === 'legendary' && '👑 '}
                  {selectedReward.tier === 'rare' && '⭐ '}
                  <Sparkles size={12} />
                  <span>Gagné !</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOUTON RÉINITIALISER */}
        {hasSpun && (
          <button className="reset-btn" onClick={resetGame}>
            <RotateCcw size={16} />
            <span>{isTestMode ? '🔄 Nouveau test' : 'Rejouer'}</span>
          </button>
        )}

        {/* ========== RÉCOMPENSES - TOUJOURS VISIBLES ========== */}
        <div className="rewards-list">
          <div className="rewards-header">
            <h4>🎁 Récompenses possibles</h4>
            <span className="rewards-badge">
              <Sparkles size={12} />
              {REWARDS.length} gains
            </span>
          </div>
          <div className="rewards-grid">
            {/* Récompenses communes */}
            <div className="reward-group-label">🔥 Courantes</div>
            {REWARDS.filter(r => r.tier === "common").map((reward) => (
              <div key={reward.id} className="reward-item">
                <span className="reward-emoji">{reward.emoji}</span>
                <span className="reward-name">{reward.label}</span>
                <span className="reward-prob">{reward.probability}%</span>
              </div>
            ))}
            
            <div className="reward-group-label">⭐ Rares (1%)</div>
            {REWARDS.filter(r => r.tier === "rare").map((reward) => (
              <div key={reward.id} className="reward-item rare">
                <span className="reward-emoji">{reward.emoji}</span>
                <span className="reward-name">{reward.label}</span>
                <span className="reward-prob">{reward.probability}%</span>
              </div>
            ))}
            
            <div className="reward-group-label">💎 Légendaire (0.1%)</div>
            {REWARDS.filter(r => r.tier === "legendary").map((reward) => (
              <div key={reward.id} className="reward-item legendary">
                <span className="reward-emoji">{reward.emoji}</span>
                <span className="reward-name">{reward.label}</span>
                <span className="reward-prob">{reward.probability}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}