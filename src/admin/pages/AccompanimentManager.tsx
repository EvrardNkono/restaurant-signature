import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Eye, EyeOff, ListPlus, Loader2 } from 'lucide-react';
import "./AccompanimentManager.css"; // Réutilisation de ton CSS existant

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/accompaniments" 
  : "https://signature-backend-alpha.vercel.app//accompaniments";

interface Accompaniment {
  _id: string;
  name: string;
  active: boolean;
}

export default function AccompanimentManager() {
  const [items, setItems] = useState<Accompaniment[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les accompagnements
  const fetchItems = async () => {
    try {
      const res = await axios.get(API_URL);
      setItems(res.data.data);
    } catch (err) {
      console.error("Erreur chargement accompagnements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Créer un nouvel accompagnement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await axios.post(API_URL, { name: name.trim(), active: true });
      setName("");
      fetchItems();
    } catch (err) {
      alert("Erreur lors de la création de l'accompagnement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basculer la visibilité (Actif/Désactivé)
  const toggleVisibility = async (item: Accompaniment) => {
    try {
      await axios.put(`${API_URL}/${item._id}`, { active: !item.active });
      fetchItems();
    } catch (err) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  // Supprimer
  const deleteItem = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet accompagnement ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchItems();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="category-manager">
      <header className="admin-header-gold">
        <span className="admin-badge">Personnalisation</span>
        <h1 className="admin-title">Gestion des Accompagnements</h1>
        <div className="header-double-line-gold"></div>
      </header>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="category-form card">
        <div className="input-group">
          <label className="input-label-gold">Nouvel Accompagnement</label>
          <div className="input-with-icon">
            <input 
              type="text" 
              placeholder="Ex: Frites Maison, Riz Basmati, Salade..." 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
        </div>
        
        <button type="submit" className="add-btn" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          {isSubmitting ? "Création..." : "Ajouter l'option"}
        </button>
      </form>

      {/* Liste des accompagnements */}
      <div className="category-list-wrapper card">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={30} />
            <p>Chargement des options...</p>
          </div>
        ) : (
          <table className="category-table">
            <thead>
              <tr>
                <th>Nom de l'option</th>
                <th>État</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className={!item.active ? "row-inactive" : ""}>
                  <td className="cat-name">
                    <ListPlus size={16} className="text-gold" style={{marginRight: '10px'}} />
                    {item.name}
                  </td>
                  <td>
                    <button 
                      className={`visibility-toggle-btn ${item.active ? "is-visible" : "is-hidden"}`}
                      onClick={() => toggleVisibility(item)}
                      title={item.active ? "Désactiver" : "Activer"}
                    >
                      {item.active ? <Eye size={18} /> : <EyeOff size={18} />}
                      <span>{item.active ? "Actif" : "Désactivé"}</span>
                    </button>
                  </td>
                  <td className="text-right">
                    <button onClick={() => deleteItem(item._id)} className="delete-btn-icon">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="empty-msg">Aucun accompagnement enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}