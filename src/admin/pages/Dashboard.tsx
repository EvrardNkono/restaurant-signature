// src/admin/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { 
  Sun, Moon, LayoutGrid, 
  ShoppingBag, DollarSign, 
  TrendingUp, Calendar, AlertCircle, Clock, CheckCircle,
  ListOrdered, Utensils  // ← J'ai ajouté ListOrdered et Utensils ici
} from "lucide-react";
import axios from "axios";
import "./Dashboard.css";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

export default function Dashboard() {
  const [displayMode, setDisplayMode] = useState("JOUR");
  
  // États pour les vraies données
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    cookingOrders: 0,
    doneOrders: 0
  });
  const [loading, setLoading] = useState(true);

  // === RÉCUPÉRATION DES COMMANDES DEPUIS L'API ===
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${BASE_API}/orders`);
      const orders = res.data.data;
      
      const totalOrders = orders.length;
      
      const totalRevenue = orders
        .filter((o: any) => o.status === "done" || o.status === "archived")
        .reduce((acc: number, curr: any) => acc + parseFloat(curr.total || 0), 0);
      
      const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
      const cookingOrders = orders.filter((o: any) => o.status === "cooking").length;
      const doneOrders = orders.filter((o: any) => o.status === "done").length;
      
      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        cookingOrders,
        doneOrders
      });
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formattedRevenue = new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(stats.totalRevenue);

  return (
    <div className="modern-dashboard">
      <div className="modern-header">
        <div>
          <h1 className="modern-title">Tableau de bord</h1>
          <p className="modern-subtitle">Bienvenue dans votre espace de gestion</p>
        </div>
        <div className="date-badge">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="stats-grid">
        {/* Carte Commandes */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <ShoppingBag size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "..." : stats.totalOrders}</span>
            <span className="stat-label">Total commandes</span>
          </div>
          <div className="stat-trend positive">
            <ListOrdered size={14} />
            <span>En temps réel</span>
          </div>
        </div>

        {/* Carte Chiffre d'affaires */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <DollarSign size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "..." : formattedRevenue}</span>
            <span className="stat-label">Chiffre d'affaires</span>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={14} />
            <span>Total encaissé</span>
          </div>
        </div>

        {/* Carte En attente */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "..." : stats.pendingOrders}</span>
            <span className="stat-label">En attente</span>
          </div>
          <div className="stat-trend">
            <AlertCircle size={14} />
            <span>À traiter</span>
          </div>
        </div>

        {/* Carte En cuisine */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Utensils size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "..." : stats.cookingOrders}</span>
            <span className="stat-label">En cuisine</span>
          </div>
          <div className="stat-trend">
            <Clock size={14} />
            <span>En préparation</span>
          </div>
        </div>

        {/* Carte Prêtes */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "..." : stats.doneOrders}</span>
            <span className="stat-label">Prêtes / Servies</span>
          </div>
          <div className="stat-trend positive">
            <CheckCircle size={14} />
            <span>À archiver</span>
          </div>
        </div>
      </div>

      <div className="mode-section">
        <h2 className="section-title-modern">Mode d'affichage du menu</h2>
        
        <div className="mode-toggles">
          <button 
            className={`mode-btn ${displayMode === 'JOUR' ? 'active' : ''}`}
            onClick={() => setDisplayMode('JOUR')}
          >
            <Sun size={18} />
            <span>Service Midi</span>
          </button>
          <button 
            className={`mode-btn ${displayMode === 'SOIR' ? 'active' : ''}`}
            onClick={() => setDisplayMode('SOIR')}
          >
            <Moon size={18} />
            <span>Service Soir</span>
          </button>
          <button 
            className={`mode-btn ${displayMode === 'CARTE' ? 'active' : ''}`}
            onClick={() => setDisplayMode('CARTE')}
          >
            <LayoutGrid size={18} />
            <span>Carte totale</span>
          </button>
        </div>
        
        <div className="mode-preview">
          <p>Aperçu actuel : <strong>{displayMode === 'JOUR' ? 'Menu du Midi' : displayMode === 'SOIR' ? 'Menu du Soir' : 'Tous les produits'}</strong></p>
          <div className="preview-bar"></div>
        </div>
      </div>
    </div>
  );
}