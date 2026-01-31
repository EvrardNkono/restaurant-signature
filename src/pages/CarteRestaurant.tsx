import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Share2 } from "lucide-react"; 
import "./carte.css";

const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:5000/api/menu" 
  : "https://signature.abbadevelop.net/api/menu";

interface Plat {
  _id: string;
  name: string;
  price: number;
  category: "Entrée" | "Plat" | "Dessert" | "Boisson" | "Formule";
  description: string;
  image: string;
  showInCarte: boolean;
  label?: string;
}

export default function CarteRestaurant() {
  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Plat["category"] | "Tous">("Tous");
  
  const categories: (Plat["category"] | "Tous")[] = ["Tous", "Entrée", "Plat", "Dessert", "Boisson"];

  useEffect(() => {
    const fetchCarte = async () => {
      try {
        const response = await axios.get(API_URL);
        const platsDeLaCarte = response.data.data.filter((p: Plat) => p.showInCarte === true);
        setPlats(platsDeLaCarte);
      } catch (error) {
        console.error("Erreur chargement de la carte:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarte();
  }, []);

  const handleSharePlat = (plat: Plat) => {
    const shareUrl = `${window.location.origin}/carte?plat=${plat._id}`;
    if (navigator.share) {
      navigator.share({
        title: plat.name,
        text: `Découvrez ce plat chez Signature : ${plat.name}`,
        url: shareUrl,
      }).catch(() => console.log("Partage annulé"));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien du plat copié !");
    }
  };

  const platsFiltres = filter === "Tous" 
    ? plats 
    : plats.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="carte-loading">
        <Loader2 className="animate-spin" size={40} color="#D4AF37" />
        <p>Ouverture de la carte gastronomique...</p>
      </div>
    );
  }

  return (
    <section className="carte-restaurant">
      {/* --- BANNIÈRE AVEC IMAGE DE FOND --- */}
      <div className="carte-banner-box">
        <div className="header-overlay-carte"></div>
        <div className="header-content-wrapper-carte">
          <div className="header-text-shield-carte">
            <div className="header-seal">S</div>
            <span className="carte-badge">La Sélection du Chef</span>
            <h2 className="carte-main-title">Carte Gastronomique</h2>
            <div className="header-double-line"></div>
          </div>
        </div>
      </div>

      <div className="carte-filtres">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="plats-grid">
        {platsFiltres.length > 0 ? (
          platsFiltres.map(plat => (
            <div key={plat._id} className="plat-card-outer">
              <div className="gold-thick-border"></div>
              <div className="plat-card-inner">
                <div className="plat-image-container">
                  <button 
                    className="share-plat-icon"
                    onClick={() => handleSharePlat(plat)}
                  >
                    <Share2 size={18} />
                  </button>

                  {plat.image ? (
                    <img src={plat.image} alt={plat.name} className="plat-img" />
                  ) : (
                    <div className="placeholder-img">Signature</div>
                  )}
                  <div className="price-badge-luxury">
                    <span>{plat.price}€</span>
                  </div>
                </div>
                <div className="plat-details-terracotta">
                  <div className="title-row">
                    <h3>{plat.name}</h3>
                    <div className="title-underline-gold"></div>
                  </div>
                  <span className="special-label-white">{plat.label || plat.category}</span>
                  <p className="description-text-light">{plat.description}</p>
                  <div className="card-footer-ornament-gold">✦ ✦ ✦</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-menu-container">
            <div className="empty-menu-content">
              <div className="empty-icon">✧</div>
              <h3>Une Nouvelle Saison se prépare</h3>
              <div className="empty-separator"></div>
              <p>
                Notre Chef renouvelle actuellement sa sélection pour vous proposer des créations 
                inspirées par les meilleurs produits du moment.
              </p>
              <p className="empty-footer">La carte sera dévoilée très prochainement.</p>
              <button onClick={() => window.location.reload()} className="refresh-btn">
                Consulter à nouveau
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}