import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Save, UploadCloud, ImageIcon, PlusCircle, Megaphone, Loader2 } from "lucide-react";
import AdManager from "./AdManager";
import "./Appearance.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/banner" 
  : "https://signature.abbadevelop.net/api/banner";

export default function Appearance() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Charger les images existantes au démarrage
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data.images) setImages(response.data.images);
      } catch (error) {
        console.error("Erreur de chargement", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  // 2. Gérer l'upload (transformation du fichier en Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 4) {
      alert("Maximum 4 images pour le slider.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImages((prev) => [...prev, base64String]);
    };
    reader.readAsDataURL(file);
  };

  // 3. Supprimer une image localement
  const removeSlide = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 4. Enregistrer vers le Backend
  const saveChanges = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/update`, { images });
      alert("Design mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loader"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="appearance-page">
      <header className="admin-header-gold">
        <div className="header-seal-small">S</div>
        <span className="admin-badge">Design & Visuels</span>
        <h1 className="admin-main-title">Identité Visuelle</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <div className="appearance-content">
        <section className="appearance-section-block">
          <div className="section-title-group">
            <div className="title-with-icon">
              <ImageIcon className="gold-icon" size={24} />
              <h2>Bannières de la Page d'Accueil</h2>
            </div>
            <p className="subtitle">Gérez les 4 images du slider. (Recommandé : Moins de 500Ko par image).</p>
          </div>

          <div className="slides-manager-grid">
            {images.map((url, index) => (
              <div key={index} className="slide-card-admin">
                <div className="gold-thin-border"></div>
                <div className="slide-image-wrapper">
                  <img src={url} alt={`Slide ${index}`} />
                  <div className="slide-overlay-actions">
                    <button className="delete-slide-btn" onClick={() => removeSlide(index)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {images.length < 4 && (
              <div className="add-slide-container">
                <div className="gold-thin-border dashed"></div>
                <label className="add-slide-placeholder">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    hidden 
                  />
                  <UploadCloud size={42} className="upload-icon" />
                  <span className="upload-title">Nouvelle Image</span>
                  <div className="plus-floating"><PlusCircle size={20} /></div>
                </label>
              </div>
            )}
          </div>
        </section>

        <section className="appearance-section-block ad-section-wrapper">
          <div className="section-title-group">
            <div className="title-with-icon">
              <Megaphone className="gold-icon" size={24} />
              <h2>Publicité Popup</h2>
            </div>
            <AdManager />
          </div>
        </section>

        <div className="appearance-actions-footer">
          <button 
            className="save-changes-btn" 
            onClick={saveChanges} 
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{saving ? "Enregistrement..." : "Enregistrer tout"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}