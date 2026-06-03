// src/admin/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { 
  Sun, Moon, LayoutGrid, 
  ShoppingBag, DollarSign, 
  TrendingUp, Calendar, AlertCircle, Clock, CheckCircle,
  ListOrdered, Utensils, Truck, ToggleLeft, ToggleRight,
  RefreshCw, Download, FileSpreadsheet, Package
} from "lucide-react";
import axios from "axios";
import "./Dashboard.css";
import InstallButtonAdmin from '../components/InstallButtonAdmin';

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

// Déclaration du type JSZip pour TypeScript
declare global {
  interface Window {
    JSZip: any;
  }
}

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
  
  // État pour la disponibilité des livraisons
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // États pour les exports
  const [exportingImages, setExportingImages] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [exportingComplete, setExportingComplete] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, status: '' });
  const [totalImagesCount, setTotalImagesCount] = useState(0);

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

  // Récupérer le nombre total d'images
  const fetchImagesCount = async () => {
    try {
      const res = await axios.get(`${BASE_API}/export/images-list`);
      if (res.data.success) {
        setTotalImagesCount(res.data.count || 0);
      }
    } catch (err) {
      console.error("Erreur chargement nombre d'images:", err);
      setTotalImagesCount(0);
    }
  };

  // Récupérer les paramètres actuels
  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${BASE_API}/settings`);
      if (res.data.success && res.data.data) {
        setDeliveryAvailable(res.data.data.deliveryAvailable ?? true);
      }
    } catch (err) {
      console.error("Erreur chargement paramètres:", err);
    }
  };

  // Basculer l'état des livraisons
  const toggleDeliveryAvailability = async () => {
    setDeliveryLoading(true);
    setSettingsMessage(null);
    
    try {
      const newState = !deliveryAvailable;
      const res = await axios.put(`${BASE_API}/settings`, {
        deliveryAvailable: newState
      });
      
      if (res.data.success) {
        setDeliveryAvailable(newState);
        setSettingsMessage({
          type: 'success',
          text: newState ? '✓ Livraisons activées' : '✓ Livraisons désactivées'
        });
        
        setTimeout(() => setSettingsMessage(null), 3000);
      } else {
        throw new Error("Réponse invalide");
      }
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      setSettingsMessage({
        type: 'error',
        text: '❌ Erreur lors de la modification'
      });
      setTimeout(() => setSettingsMessage(null), 3000);
    } finally {
      setDeliveryLoading(false);
    }
  };

  // ==================== EXPORT DES IMAGES UNIQUEMENT ====================
  const exportImagesOnly = async () => {
    setExportingImages(true);
    setDownloadProgress({ current: 0, total: 0, status: 'Préparation du téléchargement...' });
    
    try {
      setDownloadProgress({ current: 0, total: 0, status: 'Téléchargement des images...' });
      
      const response = await axios.get(`${BASE_API}/export/images/all`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `signature_images_${Date.now()}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match && match[1]) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setDownloadProgress({ current: 100, total: 100, status: 'Terminé !' });
      setTimeout(() => setDownloadProgress({ current: 0, total: 0, status: '' }), 2000);
      
    } catch (error) {
      console.error('❌ Erreur export images:', error);
      alert('❌ Erreur lors du téléchargement des images');
    } finally {
      setExportingImages(false);
    }
  };

  // ==================== EXPORT DES DONNÉES CSV ====================
  const exportDataOnly = async () => {
    setExportingData(true);
    
    try {
      const response = await axios.get(`${BASE_API}/export/plats-data`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `plats_catalogue_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Erreur export données:', error);
      alert('❌ Erreur lors du téléchargement des données');
    } finally {
      setExportingData(false);
    }
  };

  // ==================== EXPORT COMPLET (IMAGES + CSV) ====================
  const exportComplete = async () => {
    setExportingComplete(true);
    setDownloadProgress({ current: 0, total: 0, status: 'Préparation de l\'export complet...' });
    
    try {
      setDownloadProgress({ current: 10, total: 100, status: 'Génération du fichier ZIP...' });
      
      const response = await axios.get(`${BASE_API}/export/complete`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownloadProgress({ 
              current: percent, 
              total: 100, 
              status: `Téléchargement... ${percent}%` 
            });
          }
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `signature_complet_${Date.now()}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match && match[1]) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setDownloadProgress({ current: 100, total: 100, status: 'Terminé !' });
      setTimeout(() => setDownloadProgress({ current: 0, total: 0, status: '' }), 3000);
      
    } catch (error) {
      console.error('❌ Erreur export complet:', error);
      alert('❌ Erreur lors de l\'export complet. Vérifiez la console.');
    } finally {
      setExportingComplete(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchSettings();
    fetchImagesCount();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' })
        .then(reg => console.log('✅ Admin SW enregistré:', reg.scope))
        .catch(err => console.error('❌ Admin SW erreur:', err));
    }
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

      {/* SECTION CONFIGURATION LIVRAISON */}
      <div className="delivery-config-section">
        <div className="delivery-config-header">
          <Truck size={20} className="delivery-icon" />
          <h2 className="section-title-modern">Configuration des livraisons</h2>
        </div>
        
        <div className="delivery-config-card">
          <div className="delivery-config-row">
            <div className="delivery-config-info">
              <div className="delivery-config-label">
                <span className="label-icon">🚚</span>
                <span className="label-title">Service de livraison</span>
              </div>
              <p className="delivery-config-description">
                Activez ou désactivez la livraison pour tous les clients
              </p>
            </div>
            
            <div className="delivery-config-control">
              <button 
                className={`delivery-toggle-admin ${deliveryAvailable ? 'active' : 'inactive'}`}
                onClick={toggleDeliveryAvailability}
                disabled={deliveryLoading}
              >
                {deliveryLoading ? (
                  <RefreshCw size={20} className="spinning" />
                ) : deliveryAvailable ? (
                  <>
                    <ToggleRight size={24} />
                    <span>Activé</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={24} />
                    <span>Désactivé</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {settingsMessage && (
            <div className={`delivery-config-message ${settingsMessage.type}`}>
              {settingsMessage.text}
            </div>
          )}
          
          <div className="delivery-config-status">
            <div className={`status-badge ${deliveryAvailable ? 'status-active' : 'status-inactive'}`}>
              {deliveryAvailable ? '🟢 Livraisons ouvertes' : '🔴 Livraisons fermées'}
            </div>
            {!deliveryAvailable && (
              <p className="status-warning">
                ⚠️ Les clients ne pourront pas sélectionner la livraison tant que ce service est désactivé
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION EXPORT COMPLET - IMAGES + DONNÉES */}
      <div className="export-section">
        <div className="delivery-config-header">
          <Package size={20} className="delivery-icon" />
          <h2 className="section-title-modern">Export complet</h2>
        </div>
        
        <div className="export-card">
          <div className="export-info">
            <p className="export-description">
              📦 Exportez TOUT en un seul fichier ZIP : images + catalogue CSV + documentation
            </p>
            <ul className="export-list">
              <li>🖼️ Toutes les images des plats (nommées par nom de plat)</li>
              <li>📄 Fichier CSV avec : nom, description, prix, catégorie, univers, disponibilité</li>
              <li>📖 Fichier README avec instructions</li>
              <li>📊 Métadonnées JSON</li>
            </ul>
            <p className="export-note">
              <small>💡 Idéal pour créer un catalogue papier ou importer dans un autre système</small>
            </p>
          </div>
          
          <button 
            className="export-complete-btn"
            onClick={exportComplete}
            disabled={exportingComplete}
          >
            {exportingComplete ? (
              <>
                <RefreshCw size={20} className="spinning" />
                <span>{downloadProgress.status || 'Préparation...'}</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>📦 Télécharger TOUT (images + catalogue)</span>
              </>
            )}
          </button>
          
          {exportingComplete && downloadProgress.current > 0 && downloadProgress.current < 100 && (
            <div className="download-progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress.current}%` }}
              />
              <span className="progress-text">{downloadProgress.current}%</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION EXPORTS SÉPARÉS */}
      <div className="exports-separate-section">
        <div className="delivery-config-header">
          <FileSpreadsheet size={20} className="delivery-icon" />
          <h2 className="section-title-modern">Exports séparés</h2>
        </div>
        
        <div className="exports-separate-grid">
          {/* Export images uniquement */}
          <div className="export-card-small">
            <div className="export-card-icon">🖼️</div>
            <h3>Images uniquement</h3>
            <p>Téléchargez toutes les images des plats</p>
            <button 
              className="export-small-btn images-btn"
              onClick={exportImagesOnly}
              disabled={exportingImages}
            >
              {exportingImages ? (
                <RefreshCw size={16} className="spinning" />
              ) : (
                <Download size={16} />
              )}
              <span>{exportingImages ? 'Téléchargement...' : 'ZIP des images'}</span>
            </button>
            <small>{totalImagesCount || '...'} images disponibles</small>
          </div>

          {/* Export CSV uniquement */}
          <div className="export-card-small">
            <div className="export-card-icon">📊</div>
            <h3>Catalogue CSV</h3>
            <p>Téléchargez les données au format Excel</p>
            <button 
              className="export-small-btn data-btn"
              onClick={exportDataOnly}
              disabled={exportingData}
            >
              {exportingData ? (
                <RefreshCw size={16} className="spinning" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
              <span>{exportingData ? 'Génération...' : 'Télécharger CSV'}</span>
            </button>
            <small>Ouvrable avec Excel</small>
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
      <InstallButtonAdmin />
    </div>
  );
}