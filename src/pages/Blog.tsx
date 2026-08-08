// src/pages/Blog.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Heart,
  Eye,
  MessageCircle,
  Sparkles,
  Flame,
  Star,
  Newspaper,
  Clock,
  Globe,
  ChefHat,
} from "lucide-react";
import { MOCK_POSTS, MOCK_CATEGORIES } from "../data/blogData";
import type { BlogPost, BlogCategory } from "../data/blogData";
import "./blog2.css";

// --- COMPOSANT DE BANNIÈRE HERO ---
const BlogHeroBanner = () => {
  return (
    <div className="blog-hero-cinematic">
      <div className="hero-video-backdrop">
        <div className="hero-gradient-overlay"></div>
      </div>
      
      <div className="hero-particles-container">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              "--x": `${Math.random() * 100}%`,
              "--duration": `${15 + Math.random() * 20}s`,
              "--delay": `${Math.random() * 10}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="hero-content-cinematic">
        <div className="hero-badge-cinematic">
          <Globe size={16} />
          <span>Le Journal Signature - Fusion Culinaire</span>
        </div>
        
        <h1 className="hero-title-cinematic">
          L'Art du <span className="gold-gradient">Métissage</span>
        </h1>
        
        <div className="hero-separator-cinematic">
          <span className="separator-line gold"></span>
          <ChefHat size={24} className="separator-icon" />
          <span className="separator-line gold"></span>
        </div>
        
        <p className="hero-description-cinematic">
          Où l'Afrique rencontre les Caraïbes, où la France épouse l'Occident.
          Découvrez notre univers culinaire métissé, une invitation au voyage 
          à travers les saveurs du monde.
        </p>
        
        <div className="hero-stats-cinematic">
          <div className="hero-stat">
            <span className="stat-number">{MOCK_POSTS.length}+</span>
            <span className="stat-label">Articles</span>
          </div>
          <div className="hero-stat">
            <span className="stat-number">15K</span>
            <span className="stat-label">Lecteurs</span>
          </div>
          <div className="hero-stat">
            <span className="stat-number">4.9</span>
            <span className="stat-label">Note</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT ARTICLE EN CARTE ---
const BlogCard = ({ 
  post, 
  onClick,
  isFeatured = false,
}: { 
  post: BlogPost; 
  onClick: (post: BlogPost) => void;
  isFeatured?: boolean;
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: BlogCategory) => {
    return category.color || '#D4AF37';
  };

  return (
    <article className={`blog-card-enhanced ${isFeatured ? 'featured' : ''}`}>
      <div className="blog-card-inner" onClick={() => onClick(post)}>
        <div className="blog-card-media">
          <img 
            src={post.featuredImage || '/images/blog-placeholder.jpg'} 
            alt={post.title}
            className="blog-card-image"
            loading="lazy"
          />
          
          {post.isFeatured && (
            <div className="featured-badge-premium">
              <Sparkles size={12} />
              <span>À la une</span>
            </div>
          )}
          
          {post.isTrending && (
            <div className="trending-badge-premium">
              <Flame size={12} />
              <span>Tendance</span>
            </div>
          )}

          <div className="media-overlay-gradient">
            <div className="post-meta-floating">
              <span className="reading-time">
                <Clock size={14} />
                {post.readingTime} min
              </span>
            </div>
          </div>
        </div>

        <div className="blog-card-content">
          <div className="post-categories">
            {post.categories.slice(0, 2).map((category) => (
              <span 
                key={category._id}
                className="category-chip-mini"
                style={{ backgroundColor: getCategoryColor(category) }}
              >
                {category.name}
              </span>
            ))}
            {post.categories.length > 2 && (
              <span className="category-chip-mini more">+{post.categories.length - 2}</span>
            )}
          </div>

          <h3 className="post-title">{post.title}</h3>
          
          <p className="post-excerpt">{post.excerpt}</p>
          
          <div className="post-footer">
            <div className="post-author">
              {post.author?.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  className="author-avatar"
                />
              ) : (
                <div className="author-avatar-placeholder">
                  {post.author?.name?.charAt(0) || 'S'}
                </div>
              )}
              <div className="author-info">
                <span className="author-name">{post.author?.name || 'Signature'}</span>
                <span className="post-date">{formatDate(post.publishedAt)}</span>
              </div>
            </div>

            <div className="post-stats">
              <button 
                className={`stat-btn like ${isLiked ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                aria-label="J'aime"
              >
                <Heart size={16} />
                <span>{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              
              <div className="stat-btn" aria-label="Commentaires">
                <MessageCircle size={16} />
                <span>{post.comments}</span>
              </div>
              
              <div className="stat-btn" aria-label="Vues">
                <Eye size={16} />
                <span>{post.views}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function Blog() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories] = useState<BlogCategory[]>(MOCK_CATEGORIES);

  const filtered = useMemo(() => {
    let result = MOCK_POSTS;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (selectedCategory) {
      result = result.filter(post =>
        post.categories.some(cat => cat._id === selectedCategory)
      );
    }

    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return result;
  }, [searchTerm, selectedCategory]);

  const handlePostClick = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
  };

  const featuredPosts = useMemo(() => {
    return filtered.filter(post => post.isFeatured);
  }, [filtered]);

  const regularPosts = useMemo(() => {
    return filtered.filter(post => !post.isFeatured);
  }, [filtered]);

  // SEO
  useEffect(() => {
    document.title = "Blog Signature | L'Art du Métissage Culinaire - Afrique, Caraïbes, France";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Découvrez le blog du restaurant Signature : un voyage culinaire entre l\'Afrique, les Caraïbes, la France et l\'Occident. Recettes, vins et gastronomie métissée.');
    }
  }, []);

  return (
    <section className="blog-section">
      <BlogHeroBanner />

      <div className="blog-controls-enhanced">
        <div className="controls-container">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-enhanced"
              aria-label="Rechercher un article"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="categories-filter-scroll">
            <button
              className={`filter-chip ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Tous
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                className={`filter-chip ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category._id)}
                style={{
                  borderColor: selectedCategory === category._id ? category.color || '#D4AF37' : 'transparent',
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="search-results-enhanced">
          <div className="results-info">
            <Sparkles size={16} />
            <span>{filtered.length} article{filtered.length > 1 ? 's' : ''}</span>
          </div>
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              <X size={14} /> Effacer la recherche
            </button>
          )}
        </div>
      )}

      <div className="blog-grid-enhanced">
        {featuredPosts.length > 0 && (
          <div className="featured-section">
            <div className="section-header">
              <div className="section-header-left">
                <Star size={20} className="section-icon" />
                <h2 className="section-title">À la Une</h2>
              </div>
              <span className="section-divider"></span>
            </div>
            <div className="featured-grid">
              {featuredPosts.map((post) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  onClick={() => handlePostClick(post)}
                  isFeatured
                />
              ))}
            </div>
          </div>
        )}

        {regularPosts.length > 0 && (
          <div className="regular-section">
            <div className="section-header">
              <div className="section-header-left">
                <Newspaper size={20} className="section-icon" />
                <h2 className="section-title">Articles récents</h2>
              </div>
              {regularPosts.length > 0 && (
                <span className="post-count">{regularPosts.length} articles</span>
              )}
            </div>
            <div className="regular-grid">
              {regularPosts.map((post) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  onClick={() => handlePostClick(post)}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="empty-state-enhanced">
            <div className="empty-animation">
              <Newspaper size={64} color="#D4AF37" opacity={0.3} />
              <div className="empty-sparkles">
                <Sparkles size={24} className="sparkle-1" />
                <Sparkles size={16} className="sparkle-2" />
              </div>
            </div>
            <h3>Aucun article trouvé</h3>
            <p>Essayez d'autres mots-clés ou réinitialisez les filtres.</p>
            <button className="reset-filters" onClick={() => {
              setSearchTerm("");
              setSelectedCategory(null);
            }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </section>
  );
}