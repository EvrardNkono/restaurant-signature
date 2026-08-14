import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Newspaper } from "lucide-react";
import axios from "axios";
import "./BlogPage.css";

// --- CONFIGURATION ---
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/blog`;
const LIMIT = 9;

const CATEGORIES = ["Tous", "Actualités", "Recettes", "Événements", "Coulisses"];

// --- INTERFACES ---
interface BlogArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  publishedAt: string;
  views: number;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, page]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (activeCategory !== "Tous") params.category = activeCategory;

      const response = await axios.get(API_URL, { params });
      setArticles(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Erreur de chargement du blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  // Filtrage local sur la page courante (recherche titre/résumé)
  const filteredArticles = articles.filter(article => {
    const term = searchTerm.toLowerCase();
    return (
      article.title.toLowerCase().includes(term) ||
      article.excerpt?.toLowerCase().includes(term)
    );
  });

  if (loading && articles.length === 0) {
    return (
      <div className="blog-loading-enhanced">
        <div className="loading-spiral">
          <div className="spiral-ring"></div>
        </div>
        <p className="loading-text">CHARGEMENT DU BLOG...</p>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {/* HERO */}
      <section className="blog-hero-cinematic">
        <div className="blog-hero-backdrop"></div>
        <div className="blog-hero-gradient-overlay"></div>
        <div className="blog-hero-content">
          <div className="blog-hero-badge">
            <Newspaper size={14} />
            <span>Le Journal Signature</span>
          </div>
          <h1 className="blog-hero-title">
            Nos histoires,
            <span className="gold-gradient">nos saveurs</span>
          </h1>
          <p className="blog-hero-description">
            Actualités du restaurant, recettes, coulisses et événements —
            suivez la vie de Signature au fil des articles.
          </p>
        </div>
      </section>

      {/* CONTROLES */}
      <div className="blog-controls-bar">
        <div className="blog-controls-container">
          <div className="blog-search-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="blog-search-input"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="blog-categories-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`blog-category-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="blog-grid-enhanced">
        {filteredArticles.length === 0 ? (
          <div className="blog-empty-state">
            <h3>Aucun article trouvé</h3>
            <p>Essayez une autre catégorie ou une autre recherche.</p>
          </div>
        ) : (
          filteredArticles.map((article, index) => (
            <Link
              to={`/blog/${article.slug}`}
              key={article._id}
              className="blog-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="blog-card-media">
                {article.coverImage ? (
                  <img src={article.coverImage} alt={article.title} />
                ) : (
                  <div className="blog-card-no-img">S</div>
                )}
                <span className="blog-card-category-tag">{article.category}</span>
              </div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                      : ""}
                  </span>
                </div>
                <h3 className="blog-card-title">{article.title}</h3>
                {article.excerpt && <p className="blog-card-excerpt">{article.excerpt}</p>}
                <div className="blog-card-footer">
                  <span>Lire l'article</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="blog-pagination">
          <button
            className="blog-page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              className={`blog-page-btn ${page === num ? "active" : ""}`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="blog-page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
