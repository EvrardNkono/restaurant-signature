import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, Gift, ChevronRight } from "lucide-react";
import "./QuizPopup.css";

interface QuizPopupProps {
  onClose: () => void;
}

export default function QuizPopup({ onClose }: QuizPopupProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Gérer la fermeture avec animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  // Rediriger vers le quiz
  const handlePlay = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
      navigate("/quiz");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`quiz-popup-overlay ${isClosing ? "closing" : ""}`}>
      <div className={`quiz-popup-card ${isClosing ? "closing" : ""}`}>
        {/* Bouton fermer */}
        <button className="quiz-popup-close" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* Icône décorative */}
        <div className="quiz-popup-icon">
          <Sparkles size={32} />
        </div>

        {/* Message principal */}
        <h2 className="quiz-popup-title">
          Et si toute votre commande du jour
          <br />
          <span className="highlight">était 100% gratuite ?</span>
        </h2>

        <p className="quiz-popup-subtitle">
          🧑‍🍳 Répondez aux 5 questions du Chef et tentez de gagner
          <br />
          <strong>des lots exclusifs</strong> dont un repas offert !
        </p>

        {/* Règles rapides */}
        <div className="quiz-popup-rules">
          <div className="rule-item">
            <span className="rule-icon">✅</span>
            <span className="rule-text">
              <strong>5/5</strong> → Accès direct à la Roue Gagnante
            </span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">⭐</span>
            <span className="rule-text">
              <strong>3 ou 4/5</strong> → +1 point
            </span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🎡</span>
            <span className="rule-text">
              <strong>3 points</strong> → Roue 100% gagnante
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="quiz-popup-actions">
          <button className="btn-play" onClick={handlePlay}>
            <Gift size={18} />
            Tenter ma chance
            <ChevronRight size={18} />
          </button>
          <button className="btn-skip" onClick={handleClose}>
            Non merci, je regarde le menu
          </button>
        </div>

        {/* Petit texte de fermeture */}
        <p className="quiz-popup-footer">
          🎁 Des lots à gagner tous les jours
        </p>
      </div>
    </div>
  );
}