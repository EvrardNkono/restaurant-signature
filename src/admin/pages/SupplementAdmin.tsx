import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "./SupplementAdmin.css";
import { 
  Loader2, Plus, Edit2, Trash2, Check, X, Save, Search 
} from "lucide-react";

const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/";

// Interface propre pour éviter les erreurs TS
interface SupplementFormData {
  name: string;
  price: number;
  active: boolean;
}

export default function SupplementAdmin() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<SupplementFormData>({
    name: "",
    price: 0,
    active: true
  });

  // Chargement des suppléments - Plus besoin de charger les catégories !
  const { data: supplements, isLoading: loadingSupps } = useQuery({
    queryKey: ['admin-supplements'],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/supplements`);
      return res.data.data;
    }
  });

  const upsertMutation = useMutation({
    mutationFn: (data: SupplementFormData) => {
      return editingId 
        ? axios.put(`${BASE_URL}/supplements/${editingId}`, data)
        : axios.post(`${BASE_URL}/supplements`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-supplements'] });
      handleCancel();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${BASE_URL}/supplements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-supplements'] })
  });

  const handleEdit = (supp: any) => {
    setEditingId(supp._id);
    setFormData({
      name: supp.name,
      price: supp.price,
      active: supp.active
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsModalOpen(false);
    setFormData({ name: "", price: 0, active: true });
  };

  const filteredSupps = supplements?.filter((s: any) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingSupps) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="spinner-gold animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="menu-manager-page">
      <header className="menu-manager-controls">
        <div className="controls-top-row">
          <div className="search-bar-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Rechercher dans la bibliothèque..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="add-plat-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Nouveau Supplément
          </button>
        </div>
      </header>

      <div className="plats-table-wrapper">
        <table className="plats-table">
          <thead>
            <tr>
              <th>Nom du Supplément</th>
              <th>Prix Extra</th>
              <th>Disponibilité</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupps?.map((supp: any) => (
              <tr key={supp._id} className={`plat-row ${!supp.active ? "row-disabled" : ""}`}>
                <td>
                  <div className="plat-name-info">
                    <span className="name">{supp.name}</span>
                  </div>
                </td>
                <td><span className="price-tag">{supp.price.toFixed(2)}€</span></td>
                <td>
                    <span className={`v-tag ${supp.active ? 'active' : ''}`}>
                      {supp.active ? "Actif" : "Masqué"}
                    </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(supp)} title="Modifier"><Edit2 size={16} /></button>
                    <button className="delete-btn" onClick={() => { if(window.confirm("Supprimer définitivement ce supplément ?")) deleteMutation.mutate(supp._id) }} title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>{editingId ? "Éditer l'extra" : "Créer un extra"}</h2>
              <button className="close-modal" onClick={handleCancel}><X size={28} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(formData); }}>
              <div className="form-inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label className="input-label-gold">Nom (ex: Supplément Avocat)</label>
                  <input 
                    className="admin-input-terracotta"
                    type="text" value={formData.name} required 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div className="form-group">
                  <label className="input-label-gold">Prix en supplément (€)</label>
                  <input 
                    className="admin-input-terracotta"
                    type="number" step="0.01" value={formData.price} required
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                  />
                </div>

                <div className="visibility-picker">
                  <label className="check-item">
                    <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                    <div className="custom-check"><Check size={14}/></div>
                    <span className="label-text">Activer ce supplément</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCancel}>Annuler</button>
                <button type="submit" className="btn-save-gold" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}