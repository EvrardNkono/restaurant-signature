import './Testimonials.css'; 

// Définition de la structure des données pour TypeScript
interface Testimonial {
  name: string;
  review: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Sophie L.",
    review: "Une expérience inoubliable ! Le poisson braisé est une véritable signature. L'accueil à Melun est chaleureux.",
    rating: 5
  },
  {
    name: "Marc-Antoine",
    review: "Le cadre est magnifique (Terracotta et Or), on s'y sent bien. La bouillie et les beignets me rappellent mon enfance avec une touche de luxe.",
    rating: 5
  },
  {
    name: "Elena G.",
    review: "Délicieux ! Le service est rapide et le personnel est rayonnant de joie. Je reviendrai sans hésiter.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section 
      className="testimonials-section" 
      aria-labelledby="testimonials-title"
    >
      <div className="container">
        <h2 id="testimonials-title" className="section-title">
          Ce que nos clients disent
        </h2>
        <div 
          className="testimonials-grid" 
          role="list" 
          aria-label="Avis de nos clients"
        >
          {testimonials.map((item, index) => (
            <div 
              key={`testimonial-${index}`} 
              className="testimonial-card"
              role="listitem"
            >
              {/* CORRECTION ARIA : ajout de role="img" pour éviter l'attribut interdit */}
              <div 
                className="stars" 
                role="img" 
                aria-label={`Note : ${item.rating} étoiles sur 5`}
              >
                {/* Génération dynamique des étoiles */}
                {[...Array(item.rating)].map((_, i) => (
                  <span 
                    key={`star-${i}`} 
                    className="star" 
                    aria-hidden="true"
                  >
                    ★
                  </span>
                ))}
                {/* Texte caché pour les lecteurs d'écran (fallback) */}
                <span className="visually-hidden">
                  Note : {item.rating} étoiles sur 5
                </span>
              </div>
              <p className="review-text">
                "{item.review}"
              </p>
              {/* CHANGEMENT IMPORTANT: h4 → h3 pour respecter la hiérarchie */}
              <h3 className="client-name">{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}