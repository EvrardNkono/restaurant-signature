import { useState, useEffect } from "react";
import {
  Plus, Edit3, Trash2, Search, Filter, X, Save,
  Camera, Check, Loader2, Upload, Eye, EyeOff
} from "lucide-react";
import axios from "axios";
import "./BlogManager.css";

// --- CONFIGURATION ---
const CLOUD_NAME = "dbs4ghp91";
const UPLOAD_PRESET = "signature_menu";

const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/blog`;

// --- INTERFACES ---
interface ManagedArticle {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  views?: number;
  createdAt?: string;
}

const CATEGORIES = ["Actualités", "Recettes", "Événements", "Coulisses"];

export default function BlogManager() {
  // --- ÉTATS ---
  const [articles, setArticles] = useState<ManagedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("Tous");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm: ManagedArticle = {
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "Restaurant Signature",
    category: CATEGORIES[0],
    tags: [],
    isPublished: false
  };

  const [formData, setFormData] = useState(emptyForm);
  const [tagsInput, setTagsInput] = useState("");

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin`);
      setArticles(response.data.data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
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
      setFormData({ ...formData, coverImage: response.data.secure_url });
    } catch (error) {
      alert("Erreur upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // --- ACTIONS CRUD ---
  const handleOpenModal = (article?: ManagedArticle) => {
    if (article) {
      setEditingId(article._id || null);
      setFormData({ ...article });
      setTagsInput((article.tags || []).join(", "));
    } else {
      setEditingId(null);
      setFormData(emptyForm);
      setTagsInput("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/${editingId}`, payload);
        setArticles(articles.map(a => a._id === editingId ? response.data.data : a));
      } else {
        const response = await axios.post(API_URL, payload);
        setArticles([response.data.data, ...articles]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer définitivement cet article ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setArticles(articles.filter(a => a._id !== id));
      } catch (error) {
        alert("Erreur suppression");
      }
    }
  };

  const handleTogglePublish = async (article: ManagedArticle) => {
    try {
      const response = await axios.patch(`${API_URL}/${article._id}/toggle-publish`);
      setArticles(articles.map(a => a._id === article._id ? response.data.data : a));
    } catch (error) {
      alert("Erreur lors du changement de statut");
    }
  };

  // --- FILTRES ---
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      activeStatus === "Tous" ||
      (activeStatus === "Publiés" && article.isPublished) ||
      (activeStatus === "Brouillons" && !article.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="blog-manager-page">
      <header className="admin-header-gold">
        <div className="header-seal-small">S</div>
        <span className="admin-badge">Espace Maître d'Hôtel</span>
        <h1 className="admin-main-title">Gestion du Blog</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <div className="blog-manager-controls">
        <div className="controls-top-row">
          <div className="search-bar-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-article-btn" onClick={() => handleOpenModal()}>
            <Plus size={20} />
            <span>Nouvel Article</span>
          </button>
        </div>

        <div className="filter-section-admin">
          <div className="filter-label-group"><Filter size={16} className="gold-icon" /><span>Filtrer par statut :</span></div>
          <div className="status-filters-admin">
            {["Tous", "Publiés", "Brouillons"].map(status => (
              <button
                key={status}
                className={`filter-chip ${activeStatus === status ? "active" : ""}`}
                onClick={() => setActiveStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="articles-table-wrapper">
        <table className="articles-table">
          <thead>
            <tr>
              <th>Visuel</th>
              <th>Article</th>
              <th>Statut</th>
              <th>Vues</th>
              <th className="text-right">Gestion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Chargement des articles...</td></tr>
            ) : filteredArticles.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">Aucun article pour l'instant</td></tr>
            ) : filteredArticles.map((article) => (
              <tr key={article._id} className="article-row">
                <td className="td-img">
                  <div className="article-img-mini">
                    {article.coverImage ? <img src={article.coverImage} alt="" /> : <div className="no-img">S</div>}
                  </div>
                </td>
                <td className="td-info">
                  <div className="article-name-info">
                    <span className="name">{article.title}</span>
                    <span className="category-mini-tag">{article.category}</span>
                  </div>
                </td>
                <td className="td-status">
                  <div className="status-indicators">
                    {article.isPublished
                      ? <span className="v-tag active">Publié</span>
                      : <span className="v-tag">Brouillon</span>}
                    {(article.tags?.length ?? 0) > 0 && <span className="v-tag special">Tags</span>}
                  </div>
                </td>
                <td className="td-views"><span className="views-tag">{article.views ?? 0}</span></td>
                <td className="td-actions text-right">
                  <div className="action-buttons">
                    <button
                      className="publish-btn"
                      title={article.isPublished ? "Dépublier" : "Publier"}
                      onClick={() => handleTogglePublish(article)}
                    >
                      {article.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button className="edit-btn" title="Modifier" onClick={() => handleOpenModal(article)}><Edit3 size={16} /></button>
                    <button className="delete-btn" title="Supprimer" onClick={() => handleDelete(article._id!)}><Trash2 size={16} /></button>
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
              <h2>{editingId ? "Modifier l'Article" : "Nouvel Article"}</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="form-main-content">
                <div className="form-image-side">
                  <label className="image-preview-box">
                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={isUploading} />
                    {isUploading ? (
                      <div className="upload-loader"><Loader2 size={40} className="animate-spin" /></div>
                    ) : formData.coverImage ? (
                      <img src={formData.coverImage} className="preview-img-full" alt="Aperçu" />
                    ) : (
                      <><Camera size={40} /><span>Uploader la couverture 📸</span></>
                    )}
                  </label>

                  <div className="input-group">
                    <label className="input-label-gold">Image alternative (URL)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="https://..."
                        className="admin-input-terracotta"
                        value={formData.coverImage}
                        onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                      />
                      <label className="btn-upload-icon-label" title="Uploader">
                        <Upload size={20} />
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label-gold">Publication :</label>
                    <div className="visibility-picker">
                      <label className="check-item">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                        />
                        <div className="custom-check">{formData.isPublished && <Check size={14} />}</div>
                        <span className="label-text">Publier sur le site</span>
                      </label>
                    </div>
                  </div>

                  {editingId && (
                    <div className="article-meta-box">
                      <span><strong>Vues :</strong> {formData.views ?? 0}</span>
                      {formData.publishedAt && (
                        <span><strong>Publié le :</strong> {new Date(formData.publishedAt).toLocaleDateString('fr-FR')}</span>
                      )}
                      {formData.slug && <span><strong>Slug :</strong> {formData.slug}</span>}
                    </div>
                  )}
                </div>

                <div className="form-inputs-grid">
                  <div className="input-group">
                    <label className="input-label-gold">Titre de l'article</label>
                    <input
                      type="text"
                      required
                      className="admin-input-terracotta"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label className="input-label-gold">Catégorie</label>
                      <select
                        className="admin-input-terracotta select-custom"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label-gold">Auteur</label>
                      <input
                        type="text"
                        className="admin-input-terracotta"
                        value={formData.author}
                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label-gold">Résumé court (affiché dans les listes)</label>
                    <textarea
                      rows={2}
                      maxLength={300}
                      className="admin-input-terracotta"
                      value={formData.excerpt}
                      onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="input-group">
                    <label className="input-label-gold">Contenu de l'article</label>
                    <textarea
                      required
                      className="admin-input-terracotta content-textarea"
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="input-group">
                    <label className="input-label-gold">Tags (séparés par des virgules)</label>
                    <input
                      type="text"
                      placeholder="ex: ndolé, carte, saison"
                      className="admin-input-terracotta"
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                    />
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
