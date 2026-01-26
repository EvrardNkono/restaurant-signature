import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Power, PowerOff, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react'; 
import './AdManager.css';

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/ads" 
  : "https://signature.abbadevelop.net/api/ads";

const AdManager = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adConfig, setAdConfig] = useState({
    title: "",
    description: "",
    isActive: false,
    image: ""
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data) {
          setAdConfig({
            title: response.data.title || "SIGNATURE",
            description: response.data.description || "Une expérience culinaire unique.",
            isActive: response.data.isActive ?? false,
            image: response.data.image || ""
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la pub:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // FONCTION POUR GERER L'UPLOAD ET CONVERTIR EN BASE64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdConfig({ ...adConfig, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!adConfig.image) return alert("Veuillez uploader une image avant de mettre en ligne.");
    
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/update`, adConfig);
      alert("Félicitations ! La publicité est maintenant en ligne.");
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      alert("Erreur lors de la mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="menu-manager-page" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Loader2 className="animate-spin" size={30} />
      </div>
    );
  }

  return (
    <div className="menu-manager-page">
      <div className="modal-header">
        <h2>Gestion de la Publicité Popup</h2>
      </div>

      <div className="form-main-content">
        <div className="form-image-side">
          <div className="image-preview-box">
            {adConfig.image ? (
              <img src={adConfig.image} alt="Aperçu" className="preview-img-full" />
            ) : (
              <div className="no-img">
                <ImageIcon size={40} />
                <span>Aucune image</span>
              </div>
            )}
          </div>

          {/* BOUTON D'UPLOAD STYLÉ */}
          <label className="upload-file-btn">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              hidden 
            />
            <UploadCloud size={18} />
            <span>CHOISIR UNE IMAGE</span>
          </label>

          <button 
            type="button"
            className={`status-toggle-btn ${adConfig.isActive ? 'active' : 'inactive'}`}
            onClick={() => setAdConfig({...adConfig, isActive: !adConfig.isActive})}
          >
            {adConfig.isActive ? <Power size={18} /> : <PowerOff size={18} />}
            {adConfig.isActive ? "PUBLICATION ACTIVÉE" : "PUBLICATION DÉSACTIVÉE"}
          </button>
        </div>

        <div className="form-inputs-grid">
          <div className="input-group">
            <label className="input-label-gold">Titre de l'annonce</label>
            <input 
              type="text" 
              className="admin-input-terracotta"
              value={adConfig.title}
              onChange={(e) => setAdConfig({...adConfig, title: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label-gold">Texte promotionnel</label>
            <textarea 
              className="admin-input-terracotta"
              rows={3}
              value={adConfig.description}
              onChange={(e) => setAdConfig({...adConfig, description: e.target.value})}
            />
          </div>

          <div className="modal-footer">
            <button 
              className={`btn-save-gold ${isSaving ? 'loading' : ''}`} 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
              {isSaving ? "CHARGEMENT..." : "METTRE EN LIGNE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdManager;