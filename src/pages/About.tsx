import "./about.css";
// Remplace par tes vraies images
import chefImg from "../assets/images/signature-illustration.png"; 
import restoImg from "../assets/images/hero.jpg"; 

export default function About() {
  return (
    <section className="about-page">
      {/* BANNIÈRE TERRACOTTA UNIE (Titre uniquement) */}
      <div className="about-banner-box">
        <div className="about-header">
          <div className="header-seal">H</div>
          <span className="about-badge">Notre Héritage</span>
          <h2 className="about-main-title">À Propos de Nous</h2>
          <div className="header-double-line"></div>
        </div>
      </div>

      <div className="about-container">
        {/* SECTION 1 : HISTOIRE */}
        <div className="about-row">
          <div className="about-text-content">
            <h3 className="section-gold-title">L'Excellence Gastronomique</h3>
            <div className="title-separator"></div>
            <p>
              Depuis sa création, notre établissement s'efforce d'offrir une expérience 
              sensorielle unique. Niché au cœur de la ville, notre restaurant est un 
              lieu où le temps s'arrête pour laisser place à la dégustation.
            </p>
            <p>
              Notre cuisine est le reflet d'un terroir riche, travaillé avec passion 
              et précision pour sublimer chaque ingrédient.
            </p>
          </div>
          <div className="about-image-wrapper">
            <div className="gold-thick-border"></div>
            <img src={restoImg} alt="Cadre du restaurant" className="about-img" />
          </div>
        </div>

        {/* SECTION 2 : LE CHEF */}
        <div className="about-row reverse">
          <div className="about-image-wrapper">
            <div className="gold-thick-border"></div>
            <img src={chefImg} alt="Notre Chef" className="about-img" />
          </div>
          <div className="about-text-content">
            <h3 className="section-gold-title">Le Savoir-Faire du Chef</h3>
            <div className="title-separator"></div>
            <p>
              Chaque saison, notre Chef imagine une carte audacieuse qui respecte 
              le cycle de la nature. Son approche repose sur l'équilibre parfait 
              entre texture, température et saveur.
            </p>
            <blockquote className="about-quote">
              "La cuisine est un langage qui ne nécessite aucun interprète, 
              seulement de la passion."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}