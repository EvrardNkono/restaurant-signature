import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, Filter, X, Save, Camera, Check, Loader2, Upload } from "lucide-react";
import axios from "axios";
import "./MenuManager.css";

const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature.abbadevelop.net/api";

const API_URL = `${BASE_URL}/menu`;

interface ManagedPlat {
  _id?: string;
  name: string;
  price: string;
  category: "Entrée" | "Plat" | "Dessert" | "Boisson" | "Formule";
  description: string;
  image: string;
  showInCarte: boolean;
  showInMenuJour: boolean;
  showInMenuSoir: boolean;
}

export default function MenuManager() {
  const [plats, setPlats] = useState<ManagedPlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm: ManagedPlat = {
    name: "", price: "", category: "Plat", description: "", image: "",
    showInCarte: true, showInMenuJour: false, showInMenuSoir: false
  };

  const [formData, setFormData] = useState(emptyForm);
  const categories = ["Tous", "Formule", "Entrée", "Plat", "Dessert", "Boisson"];

  useEffect(() => {
    fetchPlats();
  }, []);

  const fetchPlats = async () => {
    try {
      const response = await axios.get(API_URL);
      setPlats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file); 
    }
  };

  const handleOpenModal = (plat?: ManagedPlat) => {
    if (plat) {
      setEditingId(plat._id || null);
      // Sécurité : on s'assure que les booleans existent même si absents du backend
      setFormData({ 
        ...plat,
        showInCarte: plat.showInCarte ?? false,
        showInMenuJour: plat.showInMenuJour ?? false,
        showInMenuSoir: plat.showInMenuSoir ?? false
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filteredPlats = plats.filter(plat => {
    const matchesSearch = plat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Tous" || plat.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="menu-manager-page">
      <header className="admin-header-gold">
        <div className="header-seal-small">J</div>
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
              placeholder="Rechercher dans vos créations..." 
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
          <div className="filter-label-group"><Filter size={16} className="gold-icon" /><span>Vue :</span></div>
          <div className="category-filters-admin">
            {categories.map(cat => (
              <button key={cat} className={`filter-chip ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>
                {cat}
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
               <tr>
                 <td colSpan={5} className="empty-state">
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                     <Loader2 size={20} className="animate-spin" />
                     Chargement du menu signature...
                   </div>
                 </td>
               </tr>
            ) : filteredPlats.length > 0 ? filteredPlats.map((plat) => (
              <tr key={plat._id} className="plat-row">
                <td className="td-img">
                  <div className="plat-img-mini">
                    {plat.image ? <img src={plat.image} alt="" /> : <div className="no-img">J</div>}
                  </div>
                </td>
                <td className="td-info">
                  <div className="plat-name-info">
                    <span className="name">{plat.name}</span>
                    <span className="category-mini-tag">{plat.category}</span>
                  </div>
                </td>
                
                {/* --- ZONE MISE À JOUR : AFFICHAGE DES BADGES --- */}
                <td className="td-visibility">
                  <div className="visibility-indicators">
                    {plat.showInCarte && <span className="v-tag active">Carte</span>}
                    {plat.showInMenuJour && <span className="v-tag active">Midi</span>}
                    {plat.showInMenuSoir && <span className="v-tag active">Soir</span>}
                    
                    {/* Si rien n'est coché, afficher un petit texte discret */}
                    {!plat.showInCarte && !plat.showInMenuJour && !plat.showInMenuSoir && (
                        <span className="v-tag inactive">Aucune</span>
                    )}
                  </div>
                </td>
                
                <td className="td-price"><span className="price-tag">{plat.price}€</span></td>
                <td className="td-actions text-right">
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleOpenModal(plat)}><Edit3 size={16} /></button>
                    <button className="delete-btn" onClick={() => handleDelete(plat._id!)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="empty-state">Aucun menu créé pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="gold-thin-border"></div>
            <div className="modal-header">
              <h2>{editingId ? "Modifier le Menu" : "Nouveau Chef-d'œuvre"}</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="form-main-content">
                <div className="form-image-side">
                  <label className="image-preview-box" style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    {formData.image ? (
                      <img src={formData.image} className="preview-img-full" alt="Aperçu" />
                    ) : (
                      <><Camera size={40} /><span>Cliquez pour uploader</span></>
                    )}
                  </label>
                  
                  <div className="input-group">
                    <label className="input-label-gold">Affectation automatique :</label>
                    <div className="visibility-picker">
                      <label className="check-item">
                        <input type="checkbox" checked={formData.showInCarte} onChange={e => setFormData({...formData, showInCarte: e.target.checked})} />
                        <div className="custom-check">{formData.showInCarte && <Check size={14} />}</div>
                        <span className="label-text">Carte Principale</span>
                      </label>
                      <label className="check-item">
                        <input type="checkbox" checked={formData.showInMenuJour} onChange={e => setFormData({...formData, showInMenuJour: e.target.checked})} />
                        <div className="custom-check">{formData.showInMenuJour && <Check size={14} />}</div>
                        <span className="label-text">Menu Midi (Jour)</span>
                      </label>
                      <label className="check-item">
                        <input type="checkbox" checked={formData.showInMenuSoir} onChange={e => setFormData({...formData, showInMenuSoir: e.target.checked})} />
                        <div className="custom-check">{formData.showInMenuSoir && <Check size={14} />}</div>
                        <span className="label-text">Menu Gastronomique (Soir)</span>
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
                      <input type="number" required className="admin-input-terracotta" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="input-label-gold">Catégorie</label>
                      <select className="admin-input-terracotta select-custom" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                        {categories.filter(c => c !== "Tous").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label-gold">Description & Ingrédients</label>
                    <textarea rows={4} className="admin-input-terracotta" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label-gold">Changer l'image</label>
                    <label className="admin-input-terracotta" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', justifyContent: 'center' }}>
                       <Upload size={18} /> <span>Choisir un fichier</span>
                       <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Fermer</button>
                <button type="submit" className="btn-save-gold">
                  <Save size={18} />
                  <span>{editingId ? "Mettre à jour" : "Enregistrer le Menu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}