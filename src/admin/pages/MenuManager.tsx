import { useState, useEffect } from "react";
import { 
  Plus, Edit3, Trash2, Search, Filter, X, Save, 
  Camera, Check, Loader2, Upload, ListPlus, Sparkles 
} from "lucide-react";
import axios from "axios";
import "./MenuManager.css";

// --- CONFIGURATION ---
const CLOUD_NAME = "dbs4ghp91"; 
const UPLOAD_PRESET = "signature_menu"; 

const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/menu`;
const CAT_API_URL = `${BASE_URL}/categories`;
const ACC_API_URL = `${BASE_URL}/accompaniments`;
const SUPP_API_URL = `${BASE_URL}/supplements`;

// --- INTERFACES ---
interface Category {
  _id: string;
  name: string;
  univers: "Cuisine" | "Boissons";
}

interface Accompaniment {
  _id: string;
  name: string;
}

interface Supplement {
  _id: string;
  name: string;
  price: number;
}

interface ManagedPlat {
  _id?: string;
  name: string;
  price: string;
  category: any;
  description: string;
  image: string;
  showInCarte: boolean;
  showInMenuJour: boolean;
  showInMenuSoir: boolean;
  hasAccompaniment: boolean;
  accompaniments: string[]; 
  allowSupplements: boolean; // Synchro avec le Backend
  supplements: string[];      // Pour la sélection spécifique
}

export default function MenuManager() {
  // --- ÉTATS ---
  const [plats, setPlats] = useState<ManagedPlat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAccompaniments, setAllAccompaniments] = useState<Accompaniment[]>([]);
  const [allSupplements, setAllSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm: ManagedPlat = {
    name: "", 
    price: "", 
    category: "", 
    description: "", 
    image: "", 
    showInCarte: true, 
    showInMenuJour: false, 
    showInMenuSoir: false,
    hasAccompaniment: false, 
    accompaniments: [],
    allowSupplements: false, // Initialisé à false
    supplements: []
  };

  const [formData, setFormData] = useState(emptyForm);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [platsRes, catsRes, accsRes, suppsRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(CAT_API_URL),
        axios.get(ACC_API_URL),
        axios.get(SUPP_API_URL)
      ]);
      setPlats(platsRes.data.data);
      setCategories(catsRes.data.data);
      setAllAccompaniments(accsRes.data.data);
      setAllSupplements(suppsRes.data.data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE DE SÉLECTION ---
  const handleToggleId = (field: 'accompaniments' | 'supplements', id: string) => {
    const current = [...(formData[field] || [])];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setFormData({ ...formData, [field]: current });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data);
      setFormData({ ...formData, image: response.data.secure_url });
    } catch (error) {
      alert("Erreur upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // --- ACTIONS CRUD ---
  const handleOpenModal = (plat?: ManagedPlat) => {
    if (plat) {
      setEditingId(plat._id || null);
      setFormData({ 
        ...plat,
        category: plat.category?._id || plat.category,
        accompaniments: plat.accompaniments?.map((a: any) => a._id || a) || [],
        supplements: plat.supplements?.map((s: any) => s._id || s) || [],
        allowSupplements: plat.allowSupplements || false
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm, category: categories[0]?._id || "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return alert("Veuillez sélectionner une catégorie");

    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/${editingId}`, formData);
        setPlats(plats.map(p => p._id === editingId ? response.data.data : p));
      } else {
        const response = await axios.post(API_URL, formData);
        setPlats([...plats, response.data.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Supprimer définitivement ce menu ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setPlats(plats.filter(p => p._id !== id));
      } catch (error) {
        alert("Erreur suppression");
      }
    }
  };

  // --- FILTRES ---
  const filteredPlats = plats.filter(plat => {
    const matchesSearch = plat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Tous" || plat.category?._id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="menu-manager-page">
      <header className="admin-header-gold">
        <div className="header-seal-small">S</div>
        <span className="admin-badge">Espace Maître d'Hôtel</span>
        <h1 className="admin-main-title">Configuration des Menus</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <div className="menu-manager-controls">
        <div className="controls-top-row">
          <div className="search-bar-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un plat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-plat-btn" onClick={() => handleOpenModal()}>
            <Plus size={20} />
            <span>Créer un nouveau Menu</span>
          </button>
        </div>

        <div className="filter-section-admin">
          <div className="filter-label-group"><Filter size={16} className="gold-icon" /><span>Filtrer par catégorie :</span></div>
          <div className="category-filters-admin">
            <button className={`filter-chip ${activeCategory === "Tous" ? "active" : ""}`} onClick={() => setActiveCategory("Tous")}>
              Tous
            </button>
            {categories.map(cat => (
              <button key={cat._id} className={`filter-chip ${activeCategory === cat._id ? "active" : ""}`} onClick={() => setActiveCategory(cat._id)}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="plats-table-wrapper">
        <table className="plats-table">
          <thead>
            <tr>
              <th>Visuel</th>
              <th>Désignation</th>
              <th>Affectations</th>
              <th>Prix</th>
              <th className="text-right">Gestion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan={5} className="empty-state">Chargement du cellier...</td></tr>
            ) : filteredPlats.map((plat) => (
              <tr key={plat._id} className="plat-row">
                <td className="td-img">
                  <div className="plat-img-mini">
                    {plat.image ? <img src={plat.image} alt="" /> : <div className="no-img">S</div>}
                  </div>
                </td>
                <td className="td-info">
                  <div className="plat-name-info">
                    <span className="name">{plat.name}</span>
                    <span className="category-mini-tag">
                      {plat.category?.name} <small>({plat.category?.univers})</small>
                    </span>
                  </div>
                </td>
                <td className="td-visibility">
                  <div className="visibility-indicators">
                    {plat.showInCarte && <span className="v-tag active">Carte</span>}
                    {plat.showInMenuJour && <span className="v-tag active">Midi</span>}
                    {plat.showInMenuSoir && <span className="v-tag active">Soir</span>}
                    {(plat.hasAccompaniment || plat.allowSupplements) && <span className="v-tag special">Options</span>}
                  </div>
                </td>
                <td className="td-price"><span className="price-tag">{plat.price}€</span></td>
                <td className="td-actions text-right">
                  <div className="action-buttons">
                    <button className="edit-btn" title="Modifier" onClick={() => handleOpenModal(plat)}><Edit3 size={16} /></button>
                    <button className="delete-btn" title="Supprimer" onClick={() => handleDelete(plat._id!)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ width: '95vw', maxWidth: '1400px', padding: '40px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="gold-thin-border"></div>
            <div className="modal-header">
              <h2>{editingId ? "Modifier le Menu" : "Nouveau Chef-d'œuvre"}</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="form-main-content">
                <div className="form-image-side">
                  <label className="image-preview-box">
                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={isUploading} />
                    {isUploading ? (
                      <div className="upload-loader"><Loader2 size={40} className="animate-spin" /></div>
                    ) : formData.image ? (
                      <img src={formData.image} className="preview-img-full" alt="Aperçu" />
                    ) : (
                      <><Camera size={40} /><span>Uploader 📸</span></>
                    )}
                  </label>

                  <div className="input-group" style={{ marginTop: '20px' }}>
                    <label className="input-label-gold">Visibilité sur le site :</label>
                    <div className="visibility-picker">
                      <label className="check-item">
                        <input type="checkbox" checked={formData.showInCarte} onChange={e => setFormData({...formData, showInCarte: e.target.checked})} />
                        <div className="custom-check">{formData.showInCarte && <Check size={14} />}</div>
                        <span className="label-text">Carte</span>
                      </label>
                      <label className="check-item">
                        <input type="checkbox" checked={formData.showInMenuJour} onChange={e => setFormData({...formData, showInMenuJour: e.target.checked})} />
                        <div className="custom-check">{formData.showInMenuJour && <Check size={14} />}</div>
                        <span className="label-text">Midi</span>
                      </label>
                      <label className="check-item">
                        <input type="checkbox" checked={formData.showInMenuSoir} onChange={e => setFormData({...formData, showInMenuSoir: e.target.checked})} />
                        <div className="custom-check">{formData.showInMenuSoir && <Check size={14} />}</div>
                        <span className="label-text">Soir</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-inputs-grid">
                  <div className="input-group">
                    <label className="input-label-gold">Nom du Menu ou du Plat</label>
                    <input type="text" required className="admin-input-terracotta" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label className="input-label-gold">Prix TTC (€)</label>
                      <input type="number" step="0.01" required className="admin-input-terracotta" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="input-label-gold">Catégorie</label>
                      <select 
                        className="admin-input-terracotta select-custom" 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        required
                      >
                        <option value="">-- Choisir --</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name} ({cat.univers})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label-gold">Description / Ingrédients</label>
                    <textarea rows={3} className="admin-input-terracotta" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>

                  {/* --- ACCOMPAGNEMENTS (GRATUITS) --- */}
                  <div className="input-group accompaniment-section">
                    <label className="input-label-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={formData.hasAccompaniment} onChange={e => setFormData({...formData, hasAccompaniment: e.target.checked})} />
                      <ListPlus size={18} className="text-gold" />
                      <span>Accompagnements (Gratuits)</span>
                    </label>

                    {formData.hasAccompaniment && (
                      <div className="acc-selection-grid">
                        {allAccompaniments.map(acc => (
                          <button
                            key={acc._id}
                            type="button"
                            className={`acc-choice-chip ${formData.accompaniments.includes(acc._id) ? 'selected' : ''}`}
                            onClick={() => handleToggleId('accompaniments', acc._id)}
                          >
                            {formData.accompaniments.includes(acc._id) ? <Check size={14} /> : <Plus size={14} />}
                            {acc.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* --- SUPPLÉMENTS (PAYANTS) --- */}
                  <div className="input-group accompaniment-section">
                    <label className="input-label-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.allowSupplements} 
                        onChange={e => setFormData({...formData, allowSupplements: e.target.checked})} 
                      />
                      <Sparkles size={18} />
                      <span>Autoriser les Suppléments sur ce plat</span>
                    </label>
                    
                    {formData.allowSupplements && (
                       <div className="acc-selection-grid">
                       {allSupplements.map(supp => (
                         <button
                           key={supp._id}
                           type="button"
                           className={`acc-choice-chip ${formData.supplements.includes(supp._id) ? 'selected' : ''}`}
                           onClick={() => handleToggleId('supplements', supp._id)}
                         >
                           {formData.supplements.includes(supp._id) ? <Check size={14} /> : <Plus size={14} />}
                           {supp.name} (+{supp.price}€)
                         </button>
                       ))}
                     </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label-gold">Image alternative (URL)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        className="admin-input-terracotta" 
                        value={formData.image} 
                        onChange={e => setFormData({...formData, image: e.target.value})} 
                      />
                      <label className="btn-upload-icon-label" title="Uploader">
                        <Upload size={20} />
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn-save-gold" disabled={isUploading}>
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{editingId ? "Mettre à jour" : "Enregistrer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}