import { useState, useEffect } from "react";
import { 
  Gift, Save, RefreshCw,
  Sparkles, Crown, Zap, Award, 
  PartyPopper, X
} from "lucide-react";
import "./WheelSettings.css";
// ✅ Importer le service
import { getWheelSettings, updateWheelSettings, toggleWheelGame } from "../../services/wheelService";

interface WheelSettings {
  isActive: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
}

export default function WheelSettings() {
  const [settings, setSettings] = useState<WheelSettings>({
    isActive: true,
    title: "🎡 Tentez votre chance",
    subtitle: "Gagnez des plats offerts !",
    buttonText: "Jouer"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CHARGER LES SETTINGS AVEC LE SERVICE
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getWheelSettings();
        setSettings(data);
      } catch (error) {
        console.error('Erreur chargement settings:', error);
        setError('Impossible de charger les paramètres');
      }
    };
    fetchSettings();
  }, []);

  // ✅ SAUVEGARDER AVEC LE SERVICE
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateWheelSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      // Émettre un événement pour mettre à jour le bouton flottant
      window.dispatchEvent(new CustomEvent('wheelSettingsUpdated', { 
        detail: settings 
      }));
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ TOGGLE AVEC LE SERVICE
  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await toggleWheelGame(!settings.isActive);
      setSettings(prev => ({ ...prev, isActive: result.isActive }));
      
      // Émettre un événement pour mettre à jour le bouton flottant
      window.dispatchEvent(new CustomEvent('wheelSettingsUpdated', { 
        detail: result 
      }));
    } catch (error) {
      console.error('Erreur toggle:', error);
      setError('Erreur lors du changement de statut');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wheel-settings-premium">
      {/* Bannière Hero */}
      <div className="settings-hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-icon-wrap">
            <div className="hero-icon-ring">
              <Gift size={40} />
            </div>
          </div>
          <div className="hero-text">
            <div className="hero-badge">
              <Sparkles size={12} />
              <span>Gestion Premium</span>
            </div>
            <h1>🎡 Jeu de la Roue</h1>
            <p>Gérez l'expérience interactive de votre restaurant</p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">1</span>
              <span className="stat-label">Tour gratuit</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">10</span>
              <span className="stat-label">Récompenses</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">🎯</span>
              <span className="stat-label">Engagement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="settings-card-premium">
        {/* Header avec statut */}
        <div className="settings-header-premium">
          <div className="header-title">
            <div className="title-icon">
              <Crown size={20} color="#D4AF37" />
            </div>
            <div>
              <h3>Configuration du jeu</h3>
              <p>Personnalisez l'expérience de vos clients</p>
            </div>
          </div>
          <div className="status-control">
            <div className="status-indicator">
              <div className={`status-dot ${settings.isActive ? 'active' : 'inactive'}`}></div>
              <span className={`status-text ${settings.isActive ? 'active' : 'inactive'}`}>
                {settings.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <button
              className={`toggle-premium ${settings.isActive ? 'active' : ''}`}
              onClick={handleToggle}
              disabled={isLoading}
            >
              <div className="toggle-track-premium">
                <div className="toggle-thumb-premium">
                  {settings.isActive ? <Zap size={12} /> : <X size={12} />}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ✅ AFFICHER LES ERREURS */}
        {error && (
          <div className="settings-error">
            ⚠️ {error}
          </div>
        )}

        {/* Corps du formulaire */}
        <div className="settings-body-premium">
          <div className="form-grid">
            <div className="form-group">
              <label>
                <span className="label-icon">🎯</span>
                Titre du bouton
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                className="input-premium"
                placeholder="🎡 Tentez votre chance"
              />
              <span className="input-hint">Ce qui attire l'attention</span>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">📝</span>
                Sous-titre
              </label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                className="input-premium"
                placeholder="Gagnez des plats offerts !"
              />
              <span className="input-hint">Description secondaire</span>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🔘</span>
                Texte du bouton
              </label>
              <input
                type="text"
                value={settings.buttonText}
                onChange={(e) => setSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                className="input-premium"
                placeholder="Jouer"
              />
              <span className="input-hint">Action principale</span>
            </div>
          </div>

          {/* Aperçu en direct */}
          <div className="preview-premium">
            <div className="preview-header">
              <Sparkles size={14} />
              <span>Aperçu en direct</span>
              <div className="preview-pulse"></div>
            </div>
            <div className="preview-content">
              <div className="preview-wheel-btn">
                <div className="preview-icon">
                  <Gift size={24} />
                </div>
                <div className="preview-texts">
                  <span className="preview-title">{settings.title}</span>
                  <span className="preview-subtitle">{settings.subtitle}</span>
                </div>
                <div className="preview-action">
                  <span>{settings.buttonText}</span>
                  <Sparkles size={14} />
                </div>
              </div>
              <div className="preview-badge">
                <PartyPopper size={12} />
                <span>Live Preview</span>
              </div>
            </div>
          </div>

          {/* Bouton sauvegarde */}
          <button
            className={`save-premium ${isLoading ? 'loading' : ''} ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={isLoading}
          >
            <div className="save-content">
              {isLoading ? (
                <>
                  <RefreshCw size={20} className="spinning" />
                  <span>Sauvegarde en cours...</span>
                </>
              ) : isSaved ? (
                <>
                  <Award size={20} />
                  <span>✅ Sauvegardé avec succès !</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </div>
            {!isLoading && !isSaved && (
              <div className="save-shimmer"></div>
            )}
          </button>
        </div>
      </div>

      {/* Section récompenses */}
      <div className="rewards-section-premium">
        <div className="rewards-header-premium">
          <h4><Gift size={18} /> Récompenses disponibles</h4>
          <span className="rewards-count">10 récompenses</span>
        </div>
        <div className="rewards-grid-premium">
          <div className="reward-chip common">
            <span>🥤</span> Canette de jus <span className="prob">25%</span>
          </div>
          <div className="reward-chip common">
            <span>🍚</span> Accompagnement <span className="prob">20%</span>
          </div>
          <div className="reward-chip common">
            <span>🧂</span> Supplément <span className="prob">15%</span>
          </div>
          <div className="reward-chip common">
            <span>🍗</span> Ailes de poulet <span className="prob">12%</span>
          </div>
          <div className="reward-chip rare">
            <span>🍛</span> Mafé Poulet <span className="prob">1%</span>
          </div>
          <div className="reward-chip rare">
            <span>🍋</span> Yassa Poulet <span className="prob">1%</span>
          </div>
          <div className="reward-chip rare">
            <span>🍲</span> Tchiep Poulet <span className="prob">1%</span>
          </div>
          <div className="reward-chip rare">
            <span>🥩</span> Brochettes <span className="prob">1%</span>
          </div>
          <div className="reward-chip rare">
            <span>🐟</span> Tilapia frit <span className="prob">1%</span>
          </div>
          <div className="reward-chip legendary">
            <span>💰</span> -20€ sur la note <span className="prob">0.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}