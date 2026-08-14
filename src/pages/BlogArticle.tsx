import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, User, Newspaper } from "lucide-react";
import axios from "axios";
import "./BlogArticle.css";

// --- CONFIGURATION ---
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

const API_URL = `${BASE_URL}/blog`;

// --- INTERFACES ---
interface BlogArticleDetail {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  views: number;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchArticle(slug);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      setNotFound(false);
      const response = await axios.get(`${API_URL}/${articleSlug}`);
      setArticle(response.data.data);
    } catch (error) {
      console.error("Erreur de chargement de l'article:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="article-loading">
        <p>Chargement de l'article...</p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="article-not-found">
        <Newspaper size={40} color="#D4AF37" />
        <h2>Article introuvable</h2>
        <p>Cet article n'existe pas ou n'est plus disponible.</p>
        <Link to="/blog" className="article-back-link">
          <ArrowLeft size={16} />
          <span>Retour au blog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="article-page">
      {/* HERO */}
      <div className="article-hero">
        {article.coverImage && (
          <img src={article.coverImage} alt={article.title} className="article-hero-img" />
        )}
        <div className="article-hero-overlay"></div>
        <div className="article-hero-content">
          <Link to="/blog" className="article-back-btn">
            <ArrowLeft size={16} />
            <span>Retour au blog</span>
          </Link>
          <span className="article-category-badge">{article.category}</span>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta-row">
            <span><User size={14} />{article.author}</span>
            {article.publishedAt && (
              <span>
                <Calendar size={14} />
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            <span><Eye size={14} />{article.views} vues</span>
          </div>
        </div>
      </div>

      {/* CORPS */}
      <div className="article-body-wrapper">
        {article.excerpt && (
          <p className="article-excerpt-lead">{article.excerpt}</p>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.tags?.length > 0 && (
          <div className="article-tags">
            {article.tags.map(tag => (
              <span key={tag} className="article-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="article-footer-cta">
        <Link to="/blog">
          <ArrowLeft size={16} />
          <span>Voir tous les articles</span>
        </Link>
      </div>
    </div>
  );
}
