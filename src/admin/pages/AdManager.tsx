// src/admin/pages/AdManager.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, Image as ImageIcon, Loader2, UploadCloud,
  Plus, Edit3, Trash2, Eye, EyeOff, Clock, X, Link as LinkIcon,  MoveUp, MoveDown
} from 'lucide-react';
import './AdManager.css';

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/popups" 
  : "https://signature-backend-alpha.vercel.app/api/popups";

interface Popup {
  _id?: string;
  title: string;
  description: string;
  image: string;
  link: string;
  duration: number;
  order: number;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
}

const AdManager = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const emptyForm: Popup = {
    title: "",
    description: "",
    image: "",
    link: "#",
    duration: 5,
    order: 1,
    isActive: true,
    backgroundColor: "#2D2422",
    textColor: "#D4AF37"
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchPopups();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPopups = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin`);
      setPopups(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      showNotification('error', "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (popup?: Popup) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData(popup);
    } else {
      setEditingPopup(null);
      const nextOrder = Math.min(popups.length + 1, 4);
      setFormData({ ...emptyForm, order: nextOrder });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.image) {
      showNotification('error', "Veuillez ajouter une image");
      return;
    }

    setIsSaving(true);
    try {
      if (editingPopup?._id) {
        await axios.put(`${API_URL}/${editingPopup._id}`, formData);
        showNotification('success', "Popup modifiée avec succès");
      } else {
        await axios.post(API_URL, formData);
        showNotification('success', "Popup créée avec succès");
      }
      setIsModalOpen(false);
      fetchPopups();
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer définitivement cette popup ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showNotification('success', "Popup supprimée");
        fetchPopups();
      } catch (error) {
        showNotification('error', "Erreur lors de la suppression");
      }
    }
  };

  const handleToggleActive = async (popup: Popup) => {
    try {
      await axios.put(`${API_URL}/${popup._id}`, { ...popup, isActive: !popup.isActive });
      fetchPopups();
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || "Erreur");
    }
  };

  const activeCount = popups.filter(p => p.isActive).length;

  if (loading) {
    return (
      <div className="popup-manager-loading">
        <Loader2 className="spinner" size={40} />
      </div>
    );
  }

  return (
    <div className="popup-manager-container">
      {/* Notification */}
      {notification && (
        <div className={`popup-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="popup-manager-header">
        <div className="header-icon">📢</div>
        <h1>Gestion des Popups</h1>
        <p className="header-description">
          Gérez jusqu'à 4 popups qui s'afficheront en succession automatique
        </p>
        <div className="popup-counter-badge">
          <span className={`counter ${activeCount >= 4 ? 'warning' : ''}`}>
            {activeCount} / 4 popups actives
          </span>
        </div>
      </header>

      {/* Barre d'actions */}
      <div className="popup-actions-bar">
        <button 
          className="btn-add-popup" 
          onClick={() => handleOpenModal()}
          disabled={popups.length >= 4}
        >
          <Plus size={18} />
          <span>Nouvelle popup</span>
        </button>
        <div className="info-hint">
          <Clock size={14} />
          <span>Les popups s'affichent dans l'ordre, chacune pendant sa durée</span>
        </div>
      </div>

      {/* Liste des popups */}
      <div className="popups-list">
        {popups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>Aucune popup</h3>
            <p>Créez votre première popup publicitaire</p>
            <button onClick={() => handleOpenModal()}>Créer une popup</button>
          </div>
        ) : (
          popups
            .sort((a, b) => a.order - b.order)
            .map((popup, index) => (
              <div key={popup._id} className={`popup-item ${!popup.isActive ? 'inactive' : ''}`}>
                <div className="popup-order">
                  <span className="order-number">{popup.order}</span>
                  <div className="order-arrows">
                    {index > 0 && <MoveUp size={14} className="arrow-icon" />}
                    {index < popups.length - 1 && <MoveDown size={14} className="arrow-icon" />}
                  </div>
                </div>

                <div className="popup-preview-img">
                  {popup.image ? (
                    <img src={popup.image} alt={popup.title} />
                  ) : (
                    <div className="no-img-preview"><ImageIcon size={24} /></div>
                  )}
                </div>

                <div className="popup-info">
                  <h3>{popup.title || "Sans titre"}</h3>
                  <p className="popup-desc">{popup.description.substring(0, 60)}...</p>
                  <div className="popup-meta">
                    <span className="meta-badge">
                      <Clock size={12} />
                      {popup.duration}s
                    </span>
                    {popup.link !== "#" && (
                      <span className="meta-badge link">🔗 Lien actif</span>
                    )}
                    <span 
                      className="color-preview" 
                      style={{ backgroundColor: popup.backgroundColor }}
                      title="Couleur de fond"
                    />
                    <span 
                      className="color-preview text" 
                      style={{ backgroundColor: popup.textColor }}
                      title="Couleur du texte"
                    />
                  </div>
                </div>

                <div className="popup-actions">
                  <button 
                    className={`action-toggle ${popup.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleActive(popup)}
                    title={popup.isActive ? "Désactiver" : "Activer"}
                  >
                    {popup.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span>{popup.isActive ? "Active" : "Inactive"}</span>
                  </button>
                  <button 
                    className="action-edit"
                    onClick={() => handleOpenModal(popup)}
                    title="Modifier"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-delete"
                    onClick={() => handleDelete(popup._id!)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* MODAL - Création/Édition */}
      {isModalOpen && (
        <div className="popup-modal-overlay">
          <div className="popup-modal">
            <div className="modal-gold-top"></div>
            
            <div className="modal-header">
              <h2>{editingPopup ? "Modifier la popup" : "Nouvelle popup"}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-two-columns">
                {/* Colonne gauche - Image */}
                <div className="modal-col-left">
                  <div className="image-upload-area">
                    <label className="image-preview-label">
                      <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        onChange={handleFileChange}
                      />
                      {formData.image ? (
                        <img src={formData.image} alt="Aperçu" className="preview-image" />
                      ) : (
                        <div className="upload-placeholder">
                          <UploadCloud size={48} />
                          <span>Cliquez pour uploader</span>
                          <small>JPEG, PNG, GIF</small>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="status-toggle-section">
                    <label className="toggle-label">
                      <input 
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">
                        {formData.isActive ? "Popup active" : "Popup inactive"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Colonne droite - Champs */}
                <div className="modal-col-right">
                  <div className="form-field">
                    <label>Titre *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Offre spéciale, Promotion..."
                    />
                  </div>

                  <div className="form-field">
                    <label>Description *</label>
                    <textarea 
                      rows={3}
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Détail de votre offre..."
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Durée (secondes)</label>
                      <div className="input-with-icon">
                        <Clock size={16} />
                        <input 
                          type="number"
                          min={2}
                          max={30}
                          value={formData.duration}
                          onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                        />
                      </div>
                      <small>Entre 2 et 30 secondes</small>
                    </div>

                    <div className="form-field">
                      <label>Position (ordre)</label>
                      <select
                        value={formData.order}
                        onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                        disabled={!!editingPopup}
                      >
                        <option value={1}>1ère popup</option>
                        <option value={2}>2ème popup</option>
                        <option value={3}>3ème popup</option>
                        <option value={4}>4ème popup</option>
                      </select>
                      <small>Définit l'ordre d'apparition</small>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Lien (optionnel)</label>
                    <div className="input-with-icon">
                      <LinkIcon size={16} />
                      <input 
                        type="text"
                        value={formData.link}
                        onChange={e => setFormData({...formData, link: e.target.value})}
                        placeholder="https://... ou /page"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Couleur de fond</label>
                      <div className="color-input">
                        <input 
                          type="color"
                          value={formData.backgroundColor}
                          onChange={e => setFormData({...formData, backgroundColor: e.target.value})}
                        />
                        <span>{formData.backgroundColor}</span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Couleur du texte</label>
                      <div className="color-input">
                        <input 
                          type="color"
                          value={formData.textColor}
                          onChange={e => setFormData({...formData, textColor: e.target.value})}
                        />
                        <span>{formData.textColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn-save" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
                {isSaving ? "Enregistrement..." : (editingPopup ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdManager;