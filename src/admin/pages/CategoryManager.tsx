import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Utensils, GlassWater, Eye, EyeOff, Check } from 'lucide-react';
import "./CategoryManager.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/categories" 
  : "https://signature-backend-alpha.vercel.app/api/categories";

interface Category {
  _id: string;
  name: string;
  univers: "Cuisine" | "Boissons";
  active: boolean;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategories(res.data.data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { name, univers, active });
      setName("");
      setActive(true);
      fetchCategories();
    } catch (err) { 
      alert("Erreur lors de la création."); 
    }
  };

  const toggleVisibility = async (cat: Category) => {
  try {
    // 1. On prépare la nouvelle valeur
    const newStatus = !cat.active;
    
    // 2. On envoie la mise à jour
    const res = await axios.put(`${API_URL}/${cat._id}`, { active: newStatus });
    
    // 3. Si le backend renvoie une erreur ou ne change rien, on le saura ici
    if (res.status === 200 || res.status === 204) {
      // Mise à jour locale immédiate pour éviter l'effet "rien ne se passe"
      setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, active: newStatus } : c));
    }
  } catch (err) {
    console.error("Erreur PUT:", err);
    alert("Le serveur refuse la mise à jour. Vérifiez la route API.");
  }
};

  const deleteCategory = async (id: string) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCategories();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="category-manager">
      <header className="admin-header-gold">
        <span className="admin-badge">Architecture du Menu</span>
        <h1 className="admin-title">Gestion des Catégories</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <form onSubmit={handleSubmit} className="category-form card">
        <div className="input-group">
          <label className="input-label-gold">Nom</label>
          <input 
            type="text" 
            placeholder="Entrées..." 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>
        <div className="input-group">
          <label className="input-label-gold">Univers</label>
          <select value={univers} onChange={(e) => setUnivers(e.target.value as any)}>
            <option value="Cuisine">🍴 La Table</option>
            <option value="Boissons">🍷 La Cave</option>
          </select>
        </div>
        
        <div className="input-group-checkbox">
          <label className="check-item">
            <input 
              type="checkbox" 
              checked={active} 
              onChange={e => setActive(e.target.checked)} 
            />
            <div className="custom-check">{active && <Check size={14} />}</div>
            <span className="label-text">Visible sur le site</span>
          </label>
        </div>

        <button type="submit" className="add-btn">
          <Plus size={20} /> Ajouter
        </button>
      </form>

      <div className="category-list-wrapper card">
        {loading ? (
          <p className="loading-text">Chargement des rayons...</p>
        ) : (
          <table className="category-table">
            <thead>
              <tr>
                <th>Nom de la catégorie</th>
                <th>Univers</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className={!cat.active ? "row-inactive" : ""}>
                  <td className="cat-name">{cat.name}</td>
                  <td>
                    {/* UTILISATION EXPLICITE DES ICÔNES ICI POUR SUPPRIMER L'ERREUR */}
                    <span className={`badge ${cat.univers.toLowerCase()}`}>
                      {cat.univers === "Cuisine" ? (
                        <><Utensils size={14} /> La Table</>
                      ) : (
                        <><GlassWater size={14} /> La Cave</>
                      )}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`visibility-toggle-btn ${cat.active ? "is-visible" : "is-hidden"}`}
                      onClick={() => toggleVisibility(cat)}
                      title={cat.active ? "Masquer" : "Afficher"}
                    >
                      {cat.active ? <Eye size={18} /> : <EyeOff size={18} />}
                      <span>{cat.active ? "Public" : "Brouillon"}</span>
                    </button>
                  </td>
                  <td className="text-right">
                    <button onClick={() => deleteCategory(cat._id)} className="delete-btn-icon">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-msg">Aucune catégorie créée.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}