// src/admin/pages/Dashboard.tsx
import { useState } from "react";
import { Sun, Moon, BookOpen, UtensilsCrossed, TrendingUp,} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const [displayMode, setDisplayMode] = useState("JOUR");

  return (
    <div className="admin-dashboard-signature">
      {/* En-tête avec le Sceau */}
      <header className="admin-header-gold">
        <div className="header-seal-small">J</div>
        <span className="admin-badge">Gestion Signature</span>
        <h1 className="admin-main-title">Tableau de Bord</h1>
        <div className="header-double-line-gold"></div>
      </header>

      {/* Section des Modes - Version Cartes Luxe */}
      <section className="mode-selection-wrapper">
        <h2 className="section-title-terracotta">Mode d'affichage actuel</h2>
        
        <div className="mode-cards-grid">
          {/* CARTE JOUR */}
          <div 
            className={`luxury-mode-card ${displayMode === 'JOUR' ? 'active' : ''}`}
            onClick={() => setDisplayMode('JOUR')}
          >
            <div className="luxury-card-border"></div>
            <div className="luxury-card-content">
              <Sun className="mode-icon" size={28} />
              <h3>Service Midi</h3>
              <p>Activation du Menu du Jour</p>
              <div className="active-dot">✦</div>
            </div>
          </div>

          {/* CARTE SOIR */}
          <div 
            className={`luxury-mode-card ${displayMode === 'SOIR' ? 'active' : ''}`}
            onClick={() => setDisplayMode('SOIR')}
          >
            <div className="luxury-card-border"></div>
            <div className="luxury-card-content">
              <Moon className="mode-icon" size={28} />
              <h3>Service Soir</h3>
              <p>Activation de la Carte Gastronimique</p>
              <div className="active-dot">✦</div>
            </div>
          </div>

          {/* CARTE COMPLETE */}
          <div 
            className={`luxury-mode-card ${displayMode === 'CARTE' ? 'active' : ''}`}
            onClick={() => setDisplayMode('CARTE')}
          >
            <div className="luxury-card-border"></div>
            <div className="luxury-card-content">
              <BookOpen className="mode-icon" size={28} />
              <h3>Carte Totale</h3>
              <p>Affichage de tous les produits</p>
              <div className="active-dot">✦</div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques version Terracotta */}
      <div className="stats-container-terracotta">
        <div className="stat-item">
          <TrendingUp size={18} />
          <span>12 Commandes</span>
        </div>
        <div className="stat-separator">✦</div>
        <div className="stat-item">
          <UtensilsCrossed size={18} />
          <span>45 Plats</span>
        </div>
      </div>
    </div>
  );
}