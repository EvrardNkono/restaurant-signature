import Hero from "../components/home/Hero";
import Signature from "../components/home/Signature";
import SignatureCarousel from "../components/home/SignatureCarousel";
import Highlights from "../components/home/Highlights";
import CtaFinal from "../components/home/CtaFinal";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <Hero
        title="Bienvenue au Restaurant Signature"
        subtitle="Chaque plat est une explosion de saveurs, un voyage des sens et une émotion à partager."
        ctaText="Réserver une table"
      />

      {/* NOTRE SIGNATURE – TEXTE */}
      <Signature
        title="Notre Signature"
        text="Ici, la cuisine est une expression. Nous mêlons produits de caractère, créativité contemporaine et gourmandise assumée pour offrir une expérience culinaire sincère, élégante et mémorable."
        image="/images/signature-illustration.png"
      />

      {/* CAROUSEL GOURMAND */}
      <SignatureCarousel />

      {/* PLATS PHARES */}
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
            image: "/images/poulet-braise.jfif",
            price: "12€",
          },
        ]}
      />

      {/* CTA FINAL */}
      <CtaFinal text="Réserver maintenant" />
    </main>
  );
}
