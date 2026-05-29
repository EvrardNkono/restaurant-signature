// src/admin/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { 
  Sun, Moon, LayoutGrid, 
  ShoppingBag, DollarSign, 
  TrendingUp, Calendar, AlertCircle, Clock, CheckCircle,
  ListOrdered, Utensils, Truck, ToggleLeft, ToggleRight,
  RefreshCw, Download, Image
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
  
  // État pour le téléchargement des images
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

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

  // Fonction pour charger JSZip
  const loadJSZip = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.JSZip) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  // Télécharger toutes les images en UN SEUL fichier ZIP
  const downloadAllImagesAsZip = async () => {
    setDownloadingImages(true);
    setDownloadProgress({ current: 0, total: 0 });
    
    try {
      // 1. Récupérer la liste des images
      console.log("📸 Récupération de la liste des images...");
      const response = await axios.get(`${BASE_API}/export-images`);
      const images = response.data.images;
      
      if (!images || images.length === 0) {
        alert("❌ Aucune image trouvée");
        setDownloadingImages(false);
        return;
      }
      
      console.log(`✅ ${images.length} images trouvées`);
      setDownloadProgress({ current: 0, total: images.length });
      
      // 2. Charger la librairie JSZip
      await loadJSZip();
      const zip = new window.JSZip();
      
      let count = 0;
      
      // 3. Ajouter chaque image au ZIP
      for (const img of images) {
        try {
          console.log(`📥 Téléchargement: ${img.name.substring(0, 40)}...`);
          
          // Télécharger l'image depuis Cloudinary
          const imgResponse = await fetch(img.url);
          const blob = await imgResponse.blob();
          
          // Nettoyer le nom du fichier
          const fileName = img.name
            .replace(/[^a-z0-9]/gi, '_')
            .substring(0, 50) + '.png';
          
          // Ajouter au ZIP
          zip.file(fileName, blob);
          count++;
          
          setDownloadProgress({ current: count, total: images.length });
          console.log(`✅ ${count}/${images.length} - ${img.name.substring(0, 40)}`);
        } catch(e) {
          console.error(`❌ Erreur: ${img.name}`);
        }
      }
      
      // 4. Générer et télécharger le ZIP
      console.log("📦 Création du fichier ZIP...");
      const content = await zip.generateAsync({ type: "blob" });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `signature_images_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      console.log(`✨ ZIP créé avec ${count}/${images.length} images !`);
      alert(`✅ ZIP créé avec succès !\n\n📦 ${count}/${images.length} images\n📁 Fichier: signature_images_${Date.now()}.zip`);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur lors de la création du ZIP. Vérifiez la console pour plus de détails.');
    } finally {
      setDownloadingImages(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchSettings();
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

      {/* SECTION EXPORT DES IMAGES - VERSION ZIP UNIQUE */}
      <div className="export-section">
        <div className="delivery-config-header">
          <Image size={20} className="delivery-icon" />
          <h2 className="section-title-modern">Export des images</h2>
        </div>
        
        <div className="export-card">
          <div className="export-info">
            <p className="export-description">
              Téléchargez TOUTES les images des plats en un seul fichier ZIP.
              <br />
              <small>📦 Un clic = un fichier ZIP contenant toutes les images ({stats.totalOrders ? '126' : '...'} images)</small>
            </p>
          </div>
          
          <button 
            className="export-images-btn"
            onClick={downloadAllImagesAsZip}
            disabled={downloadingImages}
          >
            {downloadingImages ? (
              <>
                <RefreshCw size={20} className="spinning" />
                <span>Création du ZIP... {downloadProgress.current}/{downloadProgress.total} images</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>📦 Télécharger TOUTES les images (ZIP unique)</span>
              </>
            )}
          </button>
          
          {downloadingImages && downloadProgress.total > 0 && (
            <div className="download-progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
              />
            </div>
          )}
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