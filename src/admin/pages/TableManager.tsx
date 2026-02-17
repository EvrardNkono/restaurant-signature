import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Smartphone, Loader2, Check, XCircle } from "lucide-react";
import "./TableManager.css";

// Gestion intelligente de l'URL comme dans ton CategoryManager
const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/tables" 
  : "https://signature-backend-alpha.vercel.app//tables";

interface Table {
  _id: string;
  number: string;
  active: boolean;
}

export default function TableManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNumber, setNewNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await axios.get(API_URL);
      setTables(res.data.data);
    } catch (err) {
      console.error("Erreur chargement tables", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber) return;
    
    setIsSubmitting(true);
    try {
      await axios.post(API_URL, { number: newNumber, active: true });
      setNewNumber("");
      fetchTables();
    } catch (err) {
      alert("Cette table existe déjà ou le serveur est injoignable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTable = async (id: string) => {
    if (window.confirm("Supprimer définitivement cette table ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTables(prev => prev.filter(t => t._id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loader-container">
        <Loader2 className="animate-spin text-gold" size={40} />
        <p>Synchronisation des plans de salle...</p>
      </div>
    );
  }

  return (
    <div className="table-manager">
      <header className="admin-header-gold">
        <span className="admin-badge">Logistique Restaurant</span>
        <h1 className="admin-title">Gestion des Tables</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <form onSubmit={handleAddTable} className="table-form card">
        <div className="input-group">
          <label className="input-label-gold">Numéro ou Nom de Table</label>
          <div className="input-with-button">
            <input 
              type="text" 
              placeholder="Ex: 1, 12, ou Terrasse A" 
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              required 
            />
            <button type="submit" className="add-btn" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={20} />}
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </form>

      <div className="table-list-wrapper card">
        <div className="table-grid">
          {tables.length > 0 ? (
            tables.map((table) => (
              <div key={table._id} className="table-item-card">
                <div className="table-info">
                  <div className="table-icon-wrapper">
                    <Smartphone size={22} />
                  </div>
                  <div className="table-details">
                    <span className="table-label">Table</span>
                    <span className="table-number">{table.number}</span>
                  </div>
                </div>
                
                <div className="table-actions">
                  <div className="status-indicator">
                    <Check size={12} /> Actif
                  </div>
                  <button 
                    onClick={() => deleteTable(table._id)} 
                    className="delete-btn-icon"
                    title="Supprimer la table"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <XCircle size={40} opacity={0.2} />
              <p>Aucune table configurée pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}