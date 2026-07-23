// src/pages/BlogPost.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Eye,
  MessageCircle,
  Calendar,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Sparkles,
  Clock3,
  Flame,
} from "lucide-react";
import { MOCK_POSTS } from "../data/blogData";
import "./blog-post.css";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    const foundPost = MOCK_POSTS.find(p => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
      
      const related = MOCK_POSTS
        .filter(p => 
          p.slug !== slug && 
          p.categories.some(c => 
            foundPost.categories.some((fc: any) => fc._id === c._id)
          )
        )
        .slice(0, 3);
      setRelatedPosts(related);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/blog');
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Blog Signature - Fusion Culinaire`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }
    }
  }, [post]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!post) {
    return (
      <div className="blog-post-loading">
        <div className="loading-spiral">
          <div className="spiral-ring"></div>
          <div className="spiral-ring"></div>
          <div className="spiral-ring"></div>
          <div className="spiral-logo">S</div>
        </div>
        <p>Chargement de l'article...</p>
      </div>
    );
  }

  return (
    <article className="blog-post-container">
      <nav className="breadcrumb" aria-label="Fil d'Ariane">
        <div className="breadcrumb-content">
          <Link to="/blog" className="breadcrumb-link">
            <ArrowLeft size={16} /> Retour au blog
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{post.title}</span>
        </div>
      </nav>

      <div className="post-hero-image">
        <img src={post.featuredImage} alt={post.title} />
        <div className="post-hero-overlay">
          <div className="post-hero-badges">
            {post.isFeatured && (
              <span className="badge-featured">
                <Sparkles size={14} /> À la une
              </span>
            )}
            {post.isTrending && (
              <span className="badge-trending">
                <Flame size={14} /> Tendance
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="post-content-wrapper">
        <div className="post-content-container">
          <header className="post-header">
            <div className="post-categories">
              {post.categories.map((category: any) => (
                <span 
                  key={category._id}
                  className="post-category-tag"
                  style={{ backgroundColor: category.color || '#D4AF37' }}
                >
                  {category.name}
                </span>
              ))}
            </div>

            <h1 className="post-title">{post.title}</h1>
            
            <div className="post-meta">
              <div className="post-author-large">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="author-avatar-large" />
                ) : (
                  <div className="author-avatar-placeholder-large">
                    {post.author?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div className="author-details">
                  <span className="author-name-large">{post.author?.name}</span>
                  <span className="author-bio">{post.author?.bio}</span>
                </div>
              </div>

              <div className="post-meta-stats">
                <span><Calendar size={14} /> {formatDate(post.publishedAt)}</span>
                <span><Clock3 size={14} /> {post.readingTime} min de lecture</span>
                <span><Eye size={14} /> {post.views} vues</span>
                <span><MessageCircle size={14} /> {post.comments} commentaires</span>
              </div>
            </div>

            <div className="post-actions">
              <button 
                className={`action-btn like ${isLiked ? 'active' : ''}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart size={18} /> {post.likes + (isLiked ? 1 : 0)}
              </button>
              <button className="action-btn share">
                <Link2 size={18} />
              </button>
            </div>
          </header>

          <div className="post-body">
            <div 
              className="post-content"
              dangerouslySetInnerHTML={{ 
                __html: post.content
                  .split('\n')
                  .map((line: string) => {
                    if (line.startsWith('## ')) {
                      return `<h2>${line.substring(3)}</h2>`;
                    } else if (line.startsWith('### ')) {
                      return `<h3>${line.substring(4)}</h3>`;
                    } else if (line.startsWith('> ')) {
                      return `<blockquote><p>${line.substring(2)}</p></blockquote>`;
                    } else if (line.startsWith('- **')) {
                      const parts = line.split('**: ');
                      if (parts.length === 2) {
                        return `<li><strong>${parts[0].substring(3)}</strong> : ${parts[1]}</li>`;
                      }
                      return `<li>${line.substring(2)}</li>`;
                    } else if (line.startsWith('- ')) {
                      return `<li>${line.substring(2)}</li>`;
                    } else if (line.trim() === '') {
                      return '<br/>';
                    } else {
                      return `<p>${line}</p>`;
                    }
                  })
                  .join('')
                  .replace(/<li>/g, '<ul><li>')
                  .replace(/<\/li>(?=<ul>|<br>)/g, '</li></ul>')
                  .replace(/<ul><li>/g, '<ul><li>')
                  .replace(/<\/li><\/ul><br\/>/g, '</li></ul>')
              }} 
            />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              <Tag size={16} className="tags-icon" />
              {post.tags.map((tag: string) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          )}

          <div className="post-share">
            <span className="share-label">Partager cet article</span>
            <div className="share-buttons">
              <button className="share-btn facebook" aria-label="Partager sur Facebook"><Facebook size={18} /></button>
              <button className="share-btn twitter" aria-label="Partager sur Twitter"><Twitter size={18} /></button>
              <button className="share-btn linkedin" aria-label="Partager sur LinkedIn"><Linkedin size={18} /></button>
              <button className="share-btn copy" aria-label="Copier le lien"><Link2 size={18} /></button>
            </div>
          </div>
        </div>

        <aside className="post-sidebar">
          <div className="sidebar-card author-card">
            <h3>À propos de l'auteur</h3>
            <div className="author-card-content">
              <img src={post.author?.avatar} alt={post.author?.name} className="author-card-avatar" />
              <h4>{post.author?.name}</h4>
              <p>{post.author?.bio}</p>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <div className="sidebar-card">
              <h3>Articles similaires</h3>
              {relatedPosts.map((related) => (
                <Link 
                  key={related._id}
                  to={`/blog/${related.slug}`}
                  className="related-post-link"
                >
                  <div className="related-post">
                    <img src={related.featuredImage} alt={related.title} className="related-post-image" />
                    <div className="related-post-info">
                      <h4>{related.title}</h4>
                      <span className="related-post-date">{formatDate(related.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="sidebar-card newsletter-card">
            <h3>Newsletter</h3>
            <p>Recevez nos articles et événements</p>
            <input type="email" placeholder="Votre email" className="newsletter-input" />
            <button className="newsletter-btn">S'abonner</button>
          </div>
        </aside>
      </div>
    </article>
  );
}