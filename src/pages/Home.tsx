import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Hero from "../components/home/Hero";
import Signature from "../components/home/Signature";
import SignatureCarousel from "../components/home/SignatureCarousel";
import Highlights from "../components/home/Highlights";
import Testimonials from "../components/home/Testimonials"; 
import CtaFinal from "../components/home/CtaFinal";

// --- FONCTION DE RÉCUPÉRATION GLOBALE ---

/**
 * On récupère TOUS les produits (Carte + Midi + Soir) en une seule fois.
 * Comme les images sont les mêmes, le navigateur les met en cache immédiatement.
 */
const fetchFullCatalog = async () => {
  console.log("🚀 Pré-chargement du catalogue global (Midi, Soir & Carte)...");
  
  // ICI : Remplace par ton URL API unique ou ta logique Supabase/Firebase
  // Exemple: const { data } = await supabase.from('products').select('*');
  const response = await fetch('/api/catalog-complet'); 
  
  if (!response.ok) throw new Error('Erreur lors du chargement du catalogue global');
  return response.json();
};

export default function Home() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // On utilise une seule clé 'full-catalog' pour tout stocker
    queryClient.prefetchQuery({
      queryKey: ['full-catalog'],
      queryFn: fetchFullCatalog,
      staleTime: 1000 * 60 * 30, // Les données restent "neuves" pendant 30 minutes
    });
  }, [queryClient]);

  return (
    <main>
      {/* HERO SECTION */}
      <Hero
        title="Bienvenue au Restaurant Signature"
        subtitle="Chaque plat est une explosion de saveurs, un voyage des sens et une émotion à partager."
        ctaText="Commander"
      />

      {/* NOTRE SIGNATURE */}
      <Signature
        title="Notre Signature"
        text="Ici, la cuisine est une expression. Nous mêlons produits de caractère, créativité contemporaine et gourmandise assumée pour offrir une expérience culinaire sincère, élégante et mémorable."
        image="/images/signature-illustration.png"
      />

      {/* CAROUSEL VISUEL */}
      <SignatureCarousel />

      {/* PLATS PHARES (HIGHLIGHTS) */}
      <Highlights
        items={[
          {
            name: "Poisson Braisé Signature",
            image: "/images/poisson-braise.jpg",
            price: "18€",
          },
          {
            name: "Cocktail Maison Infusé",
            image: "/images/cocktail.jpeg",
            price: "9€",
          },
          {
            name: "Poulet Braisé Fondant",
            image: "/images/poulet-braise3.png",
            price: "12€",
          },
        ]}
      />

      {/* AVIS CLIENTS */}
      <Testimonials />

      {/* APPEL À L'ACTION FINAL */}
      <CtaFinal text="Commander" />
    </main>
  );
}