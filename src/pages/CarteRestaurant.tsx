import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Share2, X, Utensils, GlassWater, ArrowRight } from "lucide-react"; 
import "./carte.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/menu?public=true" 
  : "https://signature-backend-alpha.vercel.app/api/menu?public=true";

// --- INTERFACES ---
interface Category {
  _id: string;
  name: string;
  univers: "Cuisine" | "Boissons";
  active: boolean;
}

interface Plat {
  _id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  showInCarte: boolean;
  label?: string;
}

// Fonction de fetch identique à celle de Home.tsx pour que react-query reconnaisse le cache
const fetchFullCatalog = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

export default function CarteRestaurant() {
  // --- UTILISATION DU CACHE ---
  // On utilise la même clé 'full-catalog' que dans Home.tsx
  const { data: allPlats, isLoading } = useQuery<Plat[]>({
    queryKey: ['full-catalog'],
    queryFn: fetchFullCatalog,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const [univers, setUnivers] = useState<"Cuisine" | "Boissons">("Cuisine");
  const [filter, setFilter] = useState<string>("Tous");
  const [selectedPlat, setSelectedPlat] = useState<Plat | null>(null);

  // --- FILTRAGE DES DONNÉES ---
  // On ne garde que les plats prévus pour la "Carte"
  const platsDeLaCarte = allPlats?.filter((p) => p.showInCarte === true) || [];

  // Logique des filtres basée sur les données filtrées
  const currentCategories = [
    "Tous",
    ...new Set(
      platsDeLaCarte
        .filter(p => p.category?.univers === univers)
        .map(p => p.category?.name)
        .filter(Boolean)
    )
  ];

  const platsFiltres = platsDeLaCarte.filter(p => {
    const matchUnivers = p.category?.univers === univers;
    if (!matchUnivers) return false;
    if (filter === "Tous") return true;
    return p.category?.name === filter;
  });

  const handleSharePlat = (plat: Plat) => {
    const shareUrl = `${window.location.origin}/carte?plat=${plat._id}`;
    if (navigator.share) {
      navigator.share({
        title: plat.name,
        text: `Découvrez chez Signature : ${plat.name}`,
        url: shareUrl,
      }).catch(() => console.log("Partage annulé"));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié !");
    }
  };

  // Loader uniquement si les données ne sont pas encore dans le cache
  if (isLoading) {
    return (
      <div className="carte-loading">
        <Loader2 className="animate-spin" size={40} color="#D4AF37" />
        <p>Ouverture de la carte gastronomique...</p>
      </div>
    );
  }

  return (
    <section className="carte-restaurant">
      <div className="carte-banner-box">
        <div className="header-overlay-carte"></div>
        <div className="header-content-wrapper-carte">
          <div className="header-text-shield-carte">
            <div className="header-seal">S</div>
            <span className="carte-badge">L'Expérience Signature</span>
            <h2 className="carte-main-title">Carte & Menus</h2>
            <div className="header-double-line"></div>
          </div>
        </div>
      </div>

      <div className="univers-selector-container">
        <div className="univers-selector">
          <button 
            className={`univers-btn ${univers === "Cuisine" ? "active" : ""}`}
            onClick={() => { setUnivers("Cuisine"); setFilter("Tous"); }}
          >
            <Utensils size={18} /> La Table
          </button>
          <button 
            className={`univers-btn ${univers === "Boissons" ? "active" : ""}`}
            onClick={() => { setUnivers("Boissons"); setFilter("Tous"); }}
          >
            <GlassWater size={18} /> La Cave & Jus
          </button>
        </div>
      </div>

      <div className="carte-filtres-container">
        <div className="scroll-hint-mobile">
          <span>Scrollez pour EXPLORER</span>
          <ArrowRight size={14} className="arrow-pulse" />
        </div>

        <div className="carte-filtres-track">
          <div className="carte-filtres-list">
            {currentCategories.map((cat, idx) => (
              <button
                key={idx}
                className={`filter-btn ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="plats-grid">
        {platsFiltres.length > 0 ? (
          platsFiltres.map(plat => (
            <div key={plat._id} className="plat-card-outer">
              <div className="gold-thick-border"></div>
              <div className={`plat-card-inner ${selectedPlat?._id === plat._id ? "is-flipped" : ""}`}>
                <div className="card-face card-front">
                  <div className="plat-image-container">
                    <button className="share-plat-icon" onClick={(e) => { e.stopPropagation(); handleSharePlat(plat); }}>
                      <Share2 size={18} />
                    </button>
                    {plat.image ? <img src={plat.image} alt={plat.name} className="plat-img" /> : <div className="placeholder-img">Signature</div>}
                    <div className="price-badge-luxury"><span>{plat.price}€</span></div>
                  </div>
                  <div className="plat-details-terracotta">
                    <h3>{plat.name}</h3>
                    <div className="title-underline-gold"></div>
                    <span className="special-label-white">{plat.category?.name}</span>
                    <p className="description-text-truncate">{plat.description}</p>
                    <button className="view-more-btn" onClick={() => setSelectedPlat(plat)}>Voir détails</button>
                    <div className="card-footer-ornament-gold">✦ ✦ ✦</div>
                  </div>
                </div>

                <div className="card-face card-back">
                  <div className="modal-content">
                    <button className="modal-close-btn" onClick={() => setSelectedPlat(null)}><X size={20} /></button>
                    <div className="modal-body">
                      <div className="modal-header-horizontal">
                        <div className="modal-circle-image">
                          <img src={plat.image} alt={plat.name} />
                        </div>
                        <div className="modal-header-info">
                          <span className="modal-badge">{plat.category?.name}</span>
                          <h3>{plat.name}</h3>
                          <div className="modal-price-tag">{plat.price}€</div>
                        </div>
                      </div>
                      <div className="title-underline-gold full-width"></div>
                      <div className="modal-details-box">
                        <p className="modal-description-full">{plat.description}</p>
                      </div>
                      <div className="card-footer-ornament-gold">✦ ✦ ✦</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-menu-container">
            <div className="empty-menu-content">
              <p>Aucun produit dans cette sélection.</p>
              <button className="refresh-btn" onClick={() => setFilter("Tous")}>Voir toute la carte</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}