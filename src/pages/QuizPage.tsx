import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./QuizPage.css";

// ============================================================
// CONFIGURATION
// ============================================================
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/quiz`;

// ============================================================
// TYPES
// ============================================================
interface Question {
  _id: string;
  question: string;
  reponseA: string;
  reponseB: string;
  reponseC: string;
  reponseD: string;
  bonneReponse: "A" | "B" | "C" | "D";
  ordre: number;
}

interface Lot {
  _id: string;
  nom: string;
  description?: string;
  probabilite: number;
  image?: string;
  actif: boolean;
}

interface QuizPlayerData {
  playerId: string;
  points: number;
  roueDebloquee: boolean;
  historique: {
    date: string;
    score: number;
    pointsGagnes: number;
  }[];
}

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
const STORAGE_KEY = "signature_quiz_data";

const generatePlayerId = (): string => {
  return "PLAYER_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
};

const getPlayerData = (): QuizPlayerData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Si corruption, recréer
    }
  }

  const newData: QuizPlayerData = {
    playerId: generatePlayerId(),
    points: 0,
    roueDebloquee: false,
    historique: [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

const savePlayerData = (data: QuizPlayerData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const addPoints = (points: number): void => {
  const data = getPlayerData();
  data.points += points;
  if (data.points >= 3) {
    data.roueDebloquee = true;
  }
  savePlayerData(data);
};

const resetPoints = (): void => {
  const data = getPlayerData();
  data.points = 0;
  data.roueDebloquee = false;
  savePlayerData(data);
};

const addHistorique = (score: number, pointsGagnes: number): void => {
  const data = getPlayerData();
  data.historique.push({
    date: new Date().toISOString(),
    score,
    pointsGagnes,
  });
  savePlayerData(data);
};

const isRoueDebloquee = (): boolean => {
  const data = getPlayerData();
  return data.roueDebloquee;
};

const getPoints = (): number => {
  const data = getPlayerData();
  return data.points;
};

const getPlayerId = (): string => {
  const data = getPlayerData();
  return data.playerId;
};

// ============================================================
// PAGE PRINCIPALE : QuizPage
// ============================================================
export default function QuizPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(getPoints);
  const [roueDebloquee, setRoueDebloquee] = useState(isRoueDebloquee);
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wheelResult, setWheelResult] = useState<{ lot: Lot; code: string } | null>(null);
  const [wheelLots, setWheelLots] = useState<Lot[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);

  // ============================================================
  // INITIALISATION
  // ============================================================
  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Récupérer la session active
        const sessionRes = await axios.get(`${API_URL}/session/active`);

        // 2. Récupérer les questions de la session
        const questionsRes = await axios.get(
          `${API_URL}/questions/${sessionRes.data._id}`
        );
        setQuestions(questionsRes.data);

        // 3. Récupérer les lots pour la roue
        const lotsRes = await axios.get(`${API_URL}/lots`);
        setWheelLots(lotsRes.data.filter((l: Lot) => l.actif));

        // 4. Les points et roue sont déjà chargés depuis le Local Storage
        setPoints(getPoints());
        setRoueDebloquee(isRoueDebloquee());

      } catch (err) {
        console.error("Erreur d'initialisation du quiz:", err);
        setError("Impossible de charger le quiz. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, []);

  // ============================================================
  // GESTIONNAIRES
  // ============================================================

  // Sélection d'une réponse
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  // Soumission d'une réponse
  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentIndex];

    try {
      const response = await axios.post(`${API_URL}/verifier`, {
        questionId: currentQuestion._id,
        reponse: selectedAnswer,
      });

      const isCorrect = response.data.correct;
      const newScore = isCorrect ? score + 1 : score;

      if (currentIndex < questions.length - 1) {
        // Passer à la question suivante
        setScore(newScore);
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
      } else {
        // Fin du quiz
        await finishQuiz(newScore);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification:", err);
      setError("Erreur lors de la vérification de la réponse.");
    }
  };

  // Fin du quiz
  const finishQuiz = async (finalScore: number) => {
    let pointsGagnes = 0;
    let accesRoue = false;

    // Règles du jeu
    if (finalScore === 5) {
      accesRoue = true; // 5/5 → roue directe
    } else if (finalScore >= 3 && finalScore <= 4) {
      pointsGagnes = 1; // 3 ou 4/5 → +1 point
    }

    // Mettre à jour les points dans Local Storage
    if (pointsGagnes > 0) {
      addPoints(pointsGagnes);
    }

    // Vérifier si la roue est débloquée
    const roueDisponible = accesRoue || getPoints() >= 3;

    // Ajouter à l'historique
    addHistorique(finalScore, pointsGagnes);

    // Mettre à jour le state
    setPoints(getPoints());
    setRoueDebloquee(roueDisponible);
    setScore(finalScore);
    setPartieTerminee(true);

    // Si roue débloquée, l'afficher automatiquement
    if (roueDisponible) {
      setShowWheel(true);
    }
  };

  // Rejouer
  const handleReplay = async () => {
    try {
      setLoading(true);
      const sessionRes = await axios.get(`${API_URL}/session/active`);
      const questionsRes = await axios.get(
        `${API_URL}/questions/${sessionRes.data._id}`
      );
      setQuestions(questionsRes.data);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setPartieTerminee(false);
      setShowWheel(false);
      setWheelResult(null);
      setPoints(getPoints());
      setRoueDebloquee(isRoueDebloquee());
    } catch (err) {
      console.error("Erreur lors du rechargement:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tourner la roue
  const handleSpinWheel = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    try {
      const playerId = getPlayerId();
      const response = await axios.post(`${API_URL}/roue`, { playerId });

      setWheelResult({
        lot: response.data.lot,
        code: response.data.codePromo,
      });

      // Réinitialiser les points après avoir tourné la roue
      resetPoints();
      setPoints(0);
      setRoueDebloquee(false);

    } catch (err) {
      console.error("Erreur lors du spin:", err);
      setError("Erreur lors du tirage de la roue.");
    } finally {
      setIsSpinning(false);
    }
  };

  // Fermeture de la roue
  const handleCloseWheel = () => {
    setShowWheel(false);
    setWheelResult(null);
    navigate("/recompenses");
  };

  // ============================================================
  // RENDU
  // ============================================================

  // --- Écran de chargement ---
  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner">
          <div className="spiral-ring"></div>
        </div>
        <p className="loading-text">CHARGEMENT DU QUIZ...</p>
      </div>
    );
  }

  // --- Écran d'erreur ---
  if (error) {
    return (
      <div className="quiz-error">
        <p className="error-icon">⚠️</p>
        <h3>Oups ! Une erreur est survenue</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  // --- Écran de la Roue ---
  if (showWheel) {
    return (
      <div className="quiz-page">
        {/* HEADER */}
        <header className="quiz-header">
          <h1 className="quiz-title">🧑‍🍳 LA QUESTION DU CHEF</h1>
        </header>

        {/* ROUE */}
        <div className="wheel-container">
          <h2 className="wheel-title">🎡 LA ROUE DU CHEF</h2>
          <p className="wheel-subtitle">100% Gagnant !</p>

          {wheelResult ? (
            // Résultat du spin
            <div className="wheel-result-card">
              <div className="result-emoji">🎉</div>
              <h2>FÉLICITATIONS !</h2>
              <div className="result-lot">
                {wheelResult.lot.image && (
                  <img src={wheelResult.lot.image} alt={wheelResult.lot.nom} />
                )}
                <h3>{wheelResult.lot.nom}</h3>
                {wheelResult.lot.description && (
                  <p>{wheelResult.lot.description}</p>
                )}
              </div>
              {wheelResult.code && (
                <div className="result-code">
                  <span>Code promo :</span>
                  <strong>{wheelResult.code}</strong>
                </div>
              )}
              <button className="btn-close-wheel" onClick={handleCloseWheel}>
                Voir mes récompenses
              </button>
            </div>
          ) : (
            // Roue à tourner
            <>
              <div className="wheel-display">
                <div className="wheel-placeholder">
                  {wheelLots.length > 0 ? (
                    wheelLots.map((lot, index) => (
                      <div
                        key={lot._id}
                        className="wheel-slot"
                        style={{
                          transform: `rotate(${index * (360 / wheelLots.length)}deg)`,
                        }}
                      >
                        <span className="wheel-label">{lot.nom}</span>
                      </div>
                    ))
                  ) : (
                    <p>Aucun lot disponible</p>
                  )}
                </div>
              </div>

              <button
                className="btn-spin"
                onClick={handleSpinWheel}
                disabled={isSpinning || wheelLots.length === 0}
              >
                {isSpinning ? "🔄 En cours..." : "TOURNER LA ROUE"}
              </button>
            </>
          )}
        </div>

        {/* NAVIGATION */}
        <BottomNav active="quiz" />
      </div>
    );
  }

  // --- Écran des résultats ---
  if (partieTerminee) {
    let emoji = "";
    let message = "";
    let action = "";

    if (score === 5) {
      emoji = "🏆";
      message = "🎉 Parfait ! Score parfait !";
      action = "Accès direct à la Roue Gagnante !";
    } else if (score >= 3 && score <= 4) {
      emoji = "⭐";
      message = `Bien joué ! Score : ${score}/5`;
      action = `+1 point (Total : ${points}/3)`;
    } else {
      emoji = "💪";
      message = `Score : ${score}/5`;
      action = "Rejouez pour accumuler des points !";
    }

    return (
      <div className="quiz-page">
        {/* HEADER */}
        <header className="quiz-header">
          <h1 className="quiz-title">🧑‍🍳 LA QUESTION DU CHEF</h1>
        </header>

        {/* RÉSULTATS */}
        <div className="quiz-results">
          <div className="results-card">
            <div className="results-emoji">{emoji}</div>
            <h2 className="results-score">{score} / 5</h2>
            <p className="results-message">{message}</p>
            <p className="results-action">{action}</p>

            {roueDebloquee && (
              <button className="btn-wheel-access" onClick={() => setShowWheel(true)}>
                🎡 Accéder à la Roue
              </button>
            )}
          </div>

          <button className="btn-rejouer" onClick={handleReplay}>
            Rejouer
          </button>
        </div>

        {/* NAVIGATION */}
        <BottomNav active="quiz" />
      </div>
    );
  }

  // --- Écran du Quiz ---
  const currentQuestion = questions[currentIndex];

  // Si pas de questions
  if (!currentQuestion) {
    return (
      <div className="quiz-page">
        <header className="quiz-header">
          <h1 className="quiz-title">🧑‍🍳 LA QUESTION DU CHEF</h1>
        </header>
        <div className="quiz-empty">
          <p>Aucune question disponible pour le moment.</p>
          <p>Revenez plus tard !</p>
        </div>
        <BottomNav active="quiz" />
      </div>
    );
  }

  const reponses = [
    { key: "A", text: currentQuestion.reponseA },
    { key: "B", text: currentQuestion.reponseB },
    { key: "C", text: currentQuestion.reponseC },
    { key: "D", text: currentQuestion.reponseD },
  ];

  const progress = Math.min((points / 3) * 100, 100);

  return (
    <div className="quiz-page">
      {/* ===== HEADER ===== */}
      <header className="quiz-header">
        <h1 className="quiz-title">🧑‍🍳 LA QUESTION DU CHEF</h1>
        <p className="quiz-subtitle">
          Testez vos connaissances et gagnez de superbes lots !
        </p>
      </header>

      {/* ===== POINTS ===== */}
      <div className="points-section">
        <div className="points-card">
          <h3 className="points-title">VOS POINTS</h3>
          <div className="points-display">
            <span className="points-current">{points}</span>
            <span className="points-separator">/</span>
            <span className="points-total">3</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="points-message">
            {points >= 3
              ? "🎉 Roue débloquée !"
              : `Encore ${3 - points} point${
                  3 - points > 1 ? "s" : ""
                } pour accéder à la Roue Gagnante !`}
          </p>
          <div
            className={`wheel-status ${roueDebloquee ? "unlocked" : "locked"}`}
          >
            {roueDebloquee ? "🎉 ROUE DÉBLOQUÉE !" : "🔒 ROUE VERROUILLÉE"}
          </div>
        </div>
      </div>

      {/* ===== QUESTION ===== */}
      <div className="question-section">
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">
              QUESTION {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <p className="question-text">{currentQuestion.question}</p>
          <div className="answers">
            {reponses.map(({ key, text }) => (
              <label
                key={key}
                className={`answer-option ${
                  selectedAnswer === key ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={key}
                  checked={selectedAnswer === key}
                  onChange={() => handleSelectAnswer(key)}
                />
                <span className="answer-letter">{key}</span>
                <span className="answer-text">{text}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RÈGLES ===== */}
      <div className="rules-section">
        <div className="rules-card">
          <h3 className="rules-title">COMMENT ÇA MARCHE ?</h3>
          <ul className="rules-list">
            <li>
              <span className="rule-icon">✅</span>
              <span className="rule-text">
                <strong>5/5</strong> Accès direct à la Roue Gagnante
              </span>
            </li>
            <li>
              <span className="rule-icon">⭐</span>
              <span className="rule-text">
                <strong>3 ou 4/5</strong> Vous gagnez 1 point
              </span>
            </li>
            <li>
              <span className="rule-icon">🔄</span>
              <span className="rule-text">
                <strong>0, 1 ou 2/5</strong> Rejouez une prochaine fois
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ===== BOUTON RÉPONDRE ===== */}
      <div className="quiz-action">
        <button
          className="btn-repondre"
          onClick={handleSubmit}
          disabled={!selectedAnswer}
        >
          RÉPONDRE
        </button>
      </div>

      {/* ===== NAVIGATION ===== */}
      <BottomNav active="quiz" />
    </div>
  );
}

// ============================================================
// COMPOSANT : BOTTOM NAV
// ============================================================
function BottomNav({ active }: { active: string }) {
  const items = [
    { key: "accueil", icon: "🏠", label: "Accueil", path: "/" },
    { key: "menu", icon: "📋", label: "Menu", path: "/menu" },
    { key: "quiz", icon: "❓", label: "Quiz", path: "/quiz" },
    {
      key: "recompenses",
      icon: "🎁",
      label: "Récompenses",
      path: "/recompenses",
    },
    { key: "compte", icon: "👤", label: "Mon compte", path: "/compte" },
  ];

  return (
    <footer className="bottom-nav">
      <nav className="nav-bottom">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.path}
            className={`nav-item ${active === item.key ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </footer>
  );
}