import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Users,
  BarChart3,
  Eye,
  EyeOff,
  Sparkles,
  ListOrdered,
  Layers,
  Award,
  Target,
  HelpCircle,
  Circle,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import "./QuizManagement.css";

// ============================================================
// CONFIGURATION
// ============================================================
const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_API}/quiz`;

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
  sessionId: string;
  ordre: number;
  createdAt: string;
}

interface Session {
  _id: string;
  nom: string;
  dateDebut: string;
  dateFin?: string;
  active: boolean;
  questionCount: number;
  createdAt: string;
}

interface Lot {
  _id: string;
  nom: string;
  description?: string;
  probabilite: number;
  typeLot: "code_genere" | "code_fixe" | "sans_code";
  codePromo?: string;
  image?: string;
  actif: boolean;
  createdAt: string;
}

interface Statistiques {
  totalParties: number;
  totalJoueurs: number;
  moyenneScore: number;
  tauxReussite: number;
  repartitionScores: {
    score0: number;
    score1: number;
    score2: number;
    score3: number;
    score4: number;
    score5: number;
  };
  lotsDistribues: {
    lotId: string;
    nom: string;
    count: number;
  }[];
}

// ============================================================
// PAGE PRINCIPALE : QuizManagement
// ============================================================
export default function QuizManagement() {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_error, setError] = useState<string | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showSessionForm, setShowSessionForm] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    reponseA: "",
    reponseB: "",
    reponseC: "",
    reponseD: "",
    bonneReponse: "A" as "A" | "B" | "C" | "D",
  });

  // Lots
  const [lots, setLots] = useState<Lot[]>([]);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [isEditingLot, setIsEditingLot] = useState(false);
  const [lotFormData, setLotFormData] = useState({
    nom: "",
    description: "",
    probabilite: 0,
    typeLot: "code_genere" as "code_genere" | "code_fixe" | "sans_code",
    codePromo: "",
    image: "",
    actif: true,
  });

  // Statistiques
  const [stats, setStats] = useState<Statistiques | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"questions" | "lots" | "stats">(
    "questions"
  );
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set()
  );
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "success" });

  // ============================================================
  // TOAST
  // ============================================================
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get<Session[]>(`${API_URL}/sessions`);
      setSessions(res.data);
      if (res.data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(res.data[0]._id);
      }
    } catch (err) {
      console.error("Erreur chargement sessions:", err);
      setError("Impossible de charger les sessions");
    }
  }, [selectedSessionId]);

  const fetchQuestions = useCallback(async () => {
    if (!selectedSessionId) return;
    try {
      const res = await axios.get<Question[]>(
        `${API_URL}/questions/${selectedSessionId}`
      );
      setQuestions(res.data);
    } catch (err) {
      console.error("Erreur chargement questions:", err);
    }
  }, [selectedSessionId]);

  const fetchLots = useCallback(async () => {
    try {
      const res = await axios.get<Lot[]>(`${API_URL}/lots`);
      setLots(res.data);
    } catch (err) {
      console.error("Erreur chargement lots:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get<Statistiques>(`${API_URL}/statistiques`);
      setStats(res.data);
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSessions(),
        fetchQuestions(),
        fetchLots(),
        fetchStats(),
      ]);
    } catch (err) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [fetchSessions, fetchQuestions, fetchLots, fetchStats]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchQuestions();
    }
  }, [selectedSessionId, fetchQuestions]);

  // ============================================================
  // SESSIONS
  // ============================================================
  const createSession = async (data: { nom: string; dateDebut: string }) => {
    try {
      const res = await axios.post<Session>(`${API_URL}/sessions`, data);
      setSessions([...sessions, res.data]);
      setSelectedSessionId(res.data._id);
      setShowSessionForm(false);
      showToast("✅ Session créée avec succès");
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const toggleSessionActive = async (sessionId: string, active: boolean) => {
    try {
      await axios.put(`${API_URL}/sessions/${sessionId}`, { active });
      setSessions(
        sessions.map((s) => (s._id === sessionId ? { ...s, active } : s))
      );
      showToast(active ? "✅ Session activée" : "⏸️ Session désactivée");
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    }
  };

  const deleteSession = async (sessionId: string) => {
    setConfirmModal({
      show: true,
      title: "Supprimer la session",
      message: "Voulez-vous vraiment supprimer cette session et toutes ses questions ?",
      onConfirm: async () => {
        setConfirmModal((m) => ({ ...m, show: false }));
        try {
          await axios.delete(`${API_URL}/sessions/${sessionId}`);
          setSessions(sessions.filter((s) => s._id !== sessionId));
          if (selectedSessionId === sessionId) {
            setSelectedSessionId(sessions[0]?._id || "");
          }
          showToast("✅ Session supprimée");
        } catch (err: any) {
          showToast(`❌ Erreur: ${err.message}`, "error");
        }
      },
    });
  };

  // ============================================================
  // QUESTIONS
  // ============================================================
  const resetForm = () => {
    setFormData({
      question: "",
      reponseA: "",
      reponseB: "",
      reponseC: "",
      reponseD: "",
      bonneReponse: "A",
    });
    setEditingQuestion(null);
    setIsEditing(false);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      reponseA: question.reponseA,
      reponseB: question.reponseB,
      reponseC: question.reponseC,
      reponseD: question.reponseD,
      bonneReponse: question.bonneReponse,
    });
    setIsEditing(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveQuestion = async () => {
    if (!selectedSessionId) {
      showToast("❌ Veuillez sélectionner une session", "error");
      return;
    }

    const { question, reponseA, reponseB, reponseC, reponseD } = formData;

    if (!question || !reponseA || !reponseB || !reponseC || !reponseD) {
      showToast("❌ Tous les champs sont obligatoires", "error");
      return;
    }

    try {
      const data = {
        question: formData.question,
        reponseA: formData.reponseA,
        reponseB: formData.reponseB,
        reponseC: formData.reponseC,
        reponseD: formData.reponseD,
        bonneReponse: formData.bonneReponse,
        sessionId: selectedSessionId,
        ordre: questions.length + 1,
      };

      if (isEditing && editingQuestion) {
        const response = await axios.put<Question>(
          `${API_URL}/questions/${editingQuestion._id}`,
          data
        );
        setQuestions(
          questions.map((q) => (q._id === editingQuestion._id ? response.data : q))
        );
        showToast("✅ Question modifiée");
      } else {
        const response = await axios.post<Question>(`${API_URL}/questions`, data);
        setQuestions([...questions, response.data]);
        showToast("✅ Question ajoutée");
      }

      resetForm();
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const deleteQuestion = async (questionId: string) => {
    setConfirmModal({
      show: true,
      title: "Supprimer la question",
      message: "Voulez-vous vraiment supprimer cette question ?",
      onConfirm: async () => {
        setConfirmModal((m) => ({ ...m, show: false }));
        try {
          await axios.delete(`${API_URL}/questions/${questionId}`);
          setQuestions(questions.filter((q) => q._id !== questionId));
          showToast("✅ Question supprimée");
        } catch (err: any) {
          showToast(`❌ Erreur: ${err.message}`, "error");
        }
      },
    });
  };

  // ============================================================
  // LOTS
  // ============================================================
  const resetLotForm = () => {
    setLotFormData({
      nom: "",
      description: "",
      probabilite: 0,
      typeLot: "code_genere",
      codePromo: "",
      image: "",
      actif: true,
    });
    setEditingLot(null);
    setIsEditingLot(false);
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setLotFormData({
      nom: lot.nom,
      description: lot.description || "",
      probabilite: lot.probabilite,
      typeLot: lot.typeLot,
      codePromo: lot.codePromo || "",
      image: lot.image || "",
      actif: lot.actif,
    });
    setIsEditingLot(true);
  };

  const saveLot = async () => {
    const { nom, probabilite } = lotFormData;

    if (!nom || probabilite <= 0) {
      showToast("❌ Le nom et la probabilité sont obligatoires", "error");
      return;
    }

    // Vérifier que la somme des probabilités ne dépasse pas 100%
    const totalProb = lots
      .filter((l) => l._id !== editingLot?._id)
      .reduce((acc, l) => acc + l.probabilite, 0);

    if (totalProb + probabilite > 100) {
      showToast(
        `❌ La somme des probabilités ne doit pas dépasser 100% (actuel: ${(
          totalProb + probabilite
        ).toFixed(1)}%)`,
        "error"
      );
      return;
    }

    try {
      if (isEditingLot && editingLot) {
        const response = await axios.put<Lot>(
          `${API_URL}/lots/${editingLot._id}`,
          lotFormData
        );
        setLots(lots.map((l) => (l._id === editingLot._id ? response.data : l)));
        showToast("✅ Lot modifié");
      } else {
        const response = await axios.post<Lot>(`${API_URL}/lots`, lotFormData);
        setLots([...lots, response.data]);
        showToast("✅ Lot ajouté");
      }

      resetLotForm();
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const deleteLot = async (lotId: string) => {
    setConfirmModal({
      show: true,
      title: "Supprimer le lot",
      message: "Voulez-vous vraiment supprimer ce lot ?",
      onConfirm: async () => {
        setConfirmModal((m) => ({ ...m, show: false }));
        try {
          await axios.delete(`${API_URL}/lots/${lotId}`);
          setLots(lots.filter((l) => l._id !== lotId));
          showToast("✅ Lot supprimé");
        } catch (err: any) {
          showToast(`❌ Erreur: ${err.message}`, "error");
        }
      },
    });
  };

  const toggleLotActive = async (lotId: string, actif: boolean) => {
    try {
      await axios.put(`${API_URL}/lots/${lotId}`, { actif });
      setLots(lots.map((l) => (l._id === lotId ? { ...l, actif } : l)));
      showToast(actif ? "✅ Lot activé" : "⏸️ Lot désactivé");
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="quiz-admin-loading">
        <Sparkles size={32} className="spin-gold" />
        <span>Chargement du quiz admin...</span>
      </div>
    );
  }

  return (
    <div className="quiz-admin-page">
      {/* ===== TOAST ===== */}
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      {/* ===== CONFIRM MODAL ===== */}
      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">{confirmModal.title}</h3>
            <p className="modal-body">{confirmModal.message}</p>
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setConfirmModal((m) => ({ ...m, show: false }))}
              >
                Annuler
              </button>
              <button className="modal-confirm" onClick={confirmModal.onConfirm}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="quiz-admin-header">
        <div className="quiz-admin-header-left">
          <div className="header-icon">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="header-title">Gestion du Quiz</h1>
            <p className="header-subtitle">
              {sessions.length} session{sessions.length > 1 ? "s" : ""},{" "}
              {questions.length} question{questions.length > 1 ? "s" : ""},{" "}
              {lots.length} lot{lots.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button className="btn-refresh" onClick={fetchAll}>
          <RefreshCw size={16} />
          Actualiser
        </button>
      </header>

      {/* ===== TABS ===== */}
      <div className="quiz-tabs">
        <button
          className={`quiz-tab ${activeTab === "questions" ? "active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          <HelpCircle size={16} /> Questions
        </button>
        <button
          className={`quiz-tab ${activeTab === "lots" ? "active" : ""}`}
          onClick={() => setActiveTab("lots")}
        >
          <Gift size={16} /> Lots
        </button>
        <button
          className={`quiz-tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <BarChart3 size={16} /> Statistiques
        </button>
      </div>

      {/* ============================================================
          TAB 1 : QUESTIONS
          ============================================================ */}
      {activeTab === "questions" && (
        <div className="quiz-tab-content">
          {/* --- Sélection de session --- */}
          <div className="session-selector">
            <div className="session-selector-header">
              <Layers size={18} />
              <span>Sessions disponibles</span>
            </div>
            <div className="session-selector-list">
              {sessions.map((session) => (
                <button
                  key={session._id}
                  className={`session-chip ${
                    selectedSessionId === session._id ? "active" : ""
                  } ${session.active ? "active-session" : "inactive-session"}`}
                  onClick={() => setSelectedSessionId(session._id)}
                >
                  <span className="session-name">{session.nom}</span>
                  <span className="session-badge">{session.active ? "✅" : "⏸️"}</span>
                  <span className="session-count">{session.questionCount} q</span>
                </button>
              ))}
              <button
                className="session-chip add-session"
                onClick={() => setShowSessionForm(true)}
              >
                <Plus size={14} /> Nouvelle
              </button>
            </div>

            {/* --- Formulaire nouvelle session --- */}
            {showSessionForm && (
              <div className="session-form">
                <h4>Créer une nouvelle session</h4>
                <div className="session-form-group">
                  <input
                    type="text"
                    placeholder="Nom de la session (ex: Août 2026)"
                    id="session-nom"
                  />
                  <input type="date" id="session-date" />
                </div>
                <div className="session-form-actions">
                  <button
                    className="btn btn-gold"
                    onClick={() => {
                      const nomInput = document.getElementById("session-nom") as HTMLInputElement;
                      const dateInput = document.getElementById("session-date") as HTMLInputElement;
                      const nom = nomInput?.value;
                      const dateDebut = dateInput?.value;
                      if (nom && dateDebut) {
                        createSession({ nom, dateDebut });
                      } else {
                        showToast("❌ Veuillez remplir tous les champs", "error");
                      }
                    }}
                  >
                    <Save size={14} /> Créer
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setShowSessionForm(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- Gestion des sessions --- */}
          <div className="session-management">
            {sessions.map((session) => (
              <div key={session._id} className="session-card">
                <div
                  className="session-card-header"
                  onClick={() => {
                    setExpandedSessions((prev) => {
                      const n = new Set(prev);
                      n.has(session._id) ? n.delete(session._id) : n.add(session._id);
                      return n;
                    });
                  }}
                >
                  <div className="session-card-left">
                    <div
                      className={`session-status-dot ${
                        session.active ? "active" : "inactive"
                      }`}
                    />
                    <h3 className="session-card-title">{session.nom}</h3>
                    <span className="session-card-date">
                      <Calendar size={12} />
                      {new Date(session.dateDebut).toLocaleDateString()}
                    </span>
                    <span className="session-card-count">
                      {session.questionCount} questions
                    </span>
                  </div>
                  <div className="session-card-right">
                    <button
                      className="session-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSessionActive(session._id, !session.active);
                      }}
                      title={session.active ? "Désactiver" : "Activer"}
                    >
                      {session.active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      className="session-action-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session._id);
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="session-expand-btn">
                      {expandedSessions.has(session._id) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {expandedSessions.has(session._id) && (
                  <div className="session-card-body">
                    {/* Liste des questions */}
                    <div className="questions-list">
                      {questions.length === 0 ? (
                        <div className="empty-state-small">
                          <p>Aucune question dans cette session</p>
                          <p className="empty-hint">
                            Ajoutez votre première question ci-dessous
                          </p>
                        </div>
                      ) : (
                        questions.map((q, index) => (
                          <div key={q._id} className="question-item">
                            <div className="question-number">{index + 1}</div>
                            <div className="question-content">
                              <p className="question-text">{q.question}</p>
                              <div className="question-answers">
                                {["A", "B", "C", "D"].map((letter) => {
                                  const reponse = q[
                                    `reponse${letter}` as keyof Question
                                  ] as string;
                                  const isCorrect = q.bonneReponse === letter;
                                  return (
                                    <span
                                      key={letter}
                                      className={`answer-chip ${
                                        isCorrect ? "correct" : ""
                                      }`}
                                    >
                                      {isCorrect ? (
                                        <CheckCircle size={10} />
                                      ) : (
                                        <Circle size={10} />
                                      )}
                                      {letter}. {reponse}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="question-actions">
                              <button
                                className="action-btn-sm"
                                onClick={() => handleEditQuestion(q)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="action-btn-sm danger"
                                onClick={() => deleteQuestion(q._id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Formulaire question */}
                    <div className="question-form">
                      <h4>
                        {isEditing ? "Modifier la question" : "Ajouter une question"}
                      </h4>
                      <div className="question-form-grid">
                        <div className="form-group full">
                          <label>Question</label>
                          <input
                            type="text"
                            value={formData.question}
                            onChange={(e) =>
                              handleFormChange("question", e.target.value)
                            }
                            placeholder="Ex: Quelle est l'épice secrète de notre sauce signature ?"
                          />
                        </div>
                        <div className="form-group">
                          <label>A. Réponse A</label>
                          <input
                            type="text"
                            value={formData.reponseA}
                            onChange={(e) =>
                              handleFormChange("reponseA", e.target.value)
                            }
                            placeholder="Réponse A"
                          />
                        </div>
                        <div className="form-group">
                          <label>B. Réponse B</label>
                          <input
                            type="text"
                            value={formData.reponseB}
                            onChange={(e) =>
                              handleFormChange("reponseB", e.target.value)
                            }
                            placeholder="Réponse B"
                          />
                        </div>
                        <div className="form-group">
                          <label>C. Réponse C</label>
                          <input
                            type="text"
                            value={formData.reponseC}
                            onChange={(e) =>
                              handleFormChange("reponseC", e.target.value)
                            }
                            placeholder="Réponse C"
                          />
                        </div>
                        <div className="form-group">
                          <label>D. Réponse D</label>
                          <input
                            type="text"
                            value={formData.reponseD}
                            onChange={(e) =>
                              handleFormChange("reponseD", e.target.value)
                            }
                            placeholder="Réponse D"
                          />
                        </div>
                        <div className="form-group">
                          <label>Bonne réponse</label>
                          <select
                            value={formData.bonneReponse}
                            onChange={(e) =>
                              handleFormChange("bonneReponse", e.target.value)
                            }
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                      </div>
                      <div className="question-form-actions">
                        <button className="btn btn-gold" onClick={saveQuestion}>
                          <Save size={14} />
                          {isEditing ? "Modifier" : "Ajouter"}
                        </button>
                        {isEditing && (
                          <button className="btn btn-ghost" onClick={resetForm}>
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2 : LOTS
          ============================================================ */}
      {activeTab === "lots" && (
        <div className="quiz-tab-content">
          <div className="lots-header">
            <h2 className="section-title">
              <Gift size={20} /> Gestion des lots
            </h2>
            <p className="section-subtitle">
              Configurez les lots disponibles sur la roue 100% gagnante
            </p>
          </div>

          {/* --- Statistiques lots --- */}
          <div className="lots-stats">
            <div className="lots-stat-card">
              <span className="lots-stat-value">
                {lots.filter((l) => l.actif).length}
              </span>
              <span className="lots-stat-label">Lots actifs</span>
            </div>
            <div className="lots-stat-card">
              <span className="lots-stat-value">
                {lots.reduce((acc, l) => acc + l.probabilite, 0).toFixed(0)}%
              </span>
              <span className="lots-stat-label">Total probabilités</span>
            </div>
            <div className="lots-stat-card">
              <span className="lots-stat-value">{lots.length}</span>
              <span className="lots-stat-label">Total lots</span>
            </div>
          </div>

          {/* --- Formulaire lot --- */}
          <div className="lot-form-card">
            <h4>{isEditingLot ? "Modifier le lot" : "Ajouter un lot"}</h4>
            <div className="lot-form-grid">
              <div className="form-group">
                <label>Nom du lot *</label>
                <input
                  type="text"
                  value={lotFormData.nom}
                  onChange={(e) =>
                    setLotFormData({ ...lotFormData, nom: e.target.value })
                  }
                  placeholder="Ex: Verre de vin offert"
                />
              </div>
              <div className="form-group">
                <label>Probabilité (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lotFormData.probabilite}
                  onChange={(e) =>
                    setLotFormData({
                      ...lotFormData,
                      probabilite: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="25"
                />
              </div>
              <div className="form-group">
                <label>Type de lot</label>
                <select
                  value={lotFormData.typeLot}
                  onChange={(e) =>
                    setLotFormData({
                      ...lotFormData,
                      typeLot: e.target.value as
                        | "code_genere"
                        | "code_fixe"
                        | "sans_code",
                    })
                  }
                >
                  <option value="code_genere">Code généré automatiquement</option>
                  <option value="code_fixe">Code fixe</option>
                  <option value="sans_code">
                    Sans code (à présenter en caisse)
                  </option>
                </select>
              </div>
              {lotFormData.typeLot === "code_fixe" && (
                <div className="form-group">
                  <label>Code promo fixe</label>
                  <input
                    type="text"
                    value={lotFormData.codePromo}
                    onChange={(e) =>
                      setLotFormData({ ...lotFormData, codePromo: e.target.value })
                    }
                    placeholder="SIG-VIN-2026"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Description (optionnel)</label>
                <input
                  type="text"
                  value={lotFormData.description}
                  onChange={(e) =>
                    setLotFormData({ ...lotFormData, description: e.target.value })
                  }
                  placeholder="Un verre de vin au choix"
                />
              </div>
              <div className="form-group">
                <label>Image (URL optionnel)</label>
                <input
                  type="text"
                  value={lotFormData.image}
                  onChange={(e) =>
                    setLotFormData({ ...lotFormData, image: e.target.value })
                  }
                  placeholder="https://.../vin.png"
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={lotFormData.actif}
                    onChange={(e) =>
                      setLotFormData({ ...lotFormData, actif: e.target.checked })
                    }
                  />
                  Actif
                </label>
              </div>
            </div>
            <div className="lot-form-actions">
              <button className="btn btn-gold" onClick={saveLot}>
                <Save size={14} />
                {isEditingLot ? "Modifier" : "Ajouter"}
              </button>
              {isEditingLot && (
                <button className="btn btn-ghost" onClick={resetLotForm}>
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* --- Liste des lots --- */}
          <div className="lots-list">
            {lots.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎁</div>
                <h3>Aucun lot</h3>
                <p>Ajoutez votre premier lot ci-dessus</p>
              </div>
            ) : (
              lots.map((lot) => (
                <div
                  key={lot._id}
                  className={`lot-item ${lot.actif ? "active" : "inactive"}`}
                >
                  <div className="lot-item-left">
                    <div
                      className={`lot-status-dot ${lot.actif ? "active" : "inactive"}`}
                    />
                    <div>
                      <h4 className="lot-name">{lot.nom}</h4>
                      {lot.description && (
                        <p className="lot-description">{lot.description}</p>
                      )}
                      <div className="lot-meta">
                        <span className="lot-prob">{lot.probabilite}%</span>
                        <span className="lot-type">
                          {lot.typeLot === "code_genere"
                            ? "Code généré"
                            : lot.typeLot === "code_fixe"
                            ? `Code: ${lot.codePromo}`
                            : "Présenter en caisse"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="lot-item-right">
                    <button
                      className="action-btn-sm"
                      onClick={() => toggleLotActive(lot._id, !lot.actif)}
                      title={lot.actif ? "Désactiver" : "Activer"}
                    >
                      {lot.actif ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      className="action-btn-sm"
                      onClick={() => handleEditLot(lot)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="action-btn-sm danger"
                      onClick={() => deleteLot(lot._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- Alerte probabilités --- */}
          {lots.length > 0 && (
            <div
              className={`probability-alert ${
                Math.abs(
                  lots.reduce((acc, l) => acc + l.probabilite, 0) - 100
                ) < 0.01
                  ? "ok"
                  : "warning"
              }`}
            >
              {Math.abs(
                lots.reduce((acc, l) => acc + l.probabilite, 0) - 100
              ) < 0.01 ? (
                <>
                  <CheckCircle size={16} />
                  <span>Total des probabilités : 100% ✅</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>
                    ⚠️ Total des probabilités :{" "}
                    {lots.reduce((acc, l) => acc + l.probabilite, 0).toFixed(1)}%
                    (doit faire 100%)
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 3 : STATISTIQUES
          ============================================================ */}
      {activeTab === "stats" && (
        <div className="quiz-tab-content">
          <div className="stats-header">
            <h2 className="section-title">
              <BarChart3 size={20} /> Statistiques du Quiz
            </h2>
          </div>

          {!stats ? (
            <div className="empty-state">
              <p>Chargement des statistiques...</p>
            </div>
          ) : (
            <>
              {/* --- Stats générales --- */}
              <div className="stats-grid-admin">
                <div className="stat-card-admin">
                  <div className="stat-icon-admin gold">
                    <Users size={20} />
                  </div>
                  <div>
                    <span className="stat-value-admin">{stats.totalJoueurs}</span>
                    <span className="stat-label-admin">Joueurs</span>
                  </div>
                </div>
                <div className="stat-card-admin">
                  <div className="stat-icon-admin blue">
                    <ListOrdered size={20} />
                  </div>
                  <div>
                    <span className="stat-value-admin">{stats.totalParties}</span>
                    <span className="stat-label-admin">Parties jouées</span>
                  </div>
                </div>
                <div className="stat-card-admin">
                  <div className="stat-icon-admin green">
                    <Target size={20} />
                  </div>
                  <div>
                    <span className="stat-value-admin">{stats.tauxReussite}%</span>
                    <span className="stat-label-admin">Taux de réussite</span>
                  </div>
                </div>
                <div className="stat-card-admin">
                  <div className="stat-icon-admin orange">
                    <Award size={20} />
                  </div>
                  <div>
                    <span className="stat-value-admin">{stats.moyenneScore}</span>
                    <span className="stat-label-admin">Score moyen /5</span>
                  </div>
                </div>
              </div>

              {/* --- Répartition des scores --- */}
              <div className="stats-section">
                <h3 className="stats-section-title">Répartition des scores</h3>
                <div className="score-distribution">
                  {[0, 1, 2, 3, 4, 5].map((score) => {
                    const count =
                      stats.repartitionScores[
                        `score${score}` as keyof typeof stats.repartitionScores
                      ] || 0;
                    const max = Math.max(
                      ...Object.values(stats.repartitionScores)
                    );
                    const percentage = max > 0 ? (count / max) * 100 : 0;
                    return (
                      <div key={score} className="score-bar">
                        <span className="score-label">{score}/5</span>
                        <div className="score-bar-track">
                          <div
                            className={`score-bar-fill ${
                              score >= 3 ? "good" : "bad"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="score-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- Lots distribués --- */}
              <div className="stats-section">
                <h3 className="stats-section-title">Lots distribués</h3>
                {stats.lotsDistribues.length === 0 ? (
                  <p className="empty-text">Aucun lot distribué pour le moment</p>
                ) : (
                  <div className="lots-distribution">
                    {stats.lotsDistribues.map((lot) => (
                      <div key={lot.lotId} className="lot-dist-item">
                        <span className="lot-dist-name">{lot.nom}</span>
                        <span className="lot-dist-count">{lot.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}