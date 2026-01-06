// data/menu.ts
export interface Plat {
  id: number;
  name: string;
  description: string;
  price: string;
  category: "Entrée" | "Plat" | "Dessert" | "Boisson";
  image?: string; // optionnel
  label?: "Végétarien" | "Épicé" | "Plat du chef";
}

// Exemple de carte complète
export const carte: Plat[] = [
  {
    id: 1,
    name: "Salade de mangue exotique",
    description: "Mangue fraîche, avocat, coriandre et citron vert",
    price: "7€",
    category: "Entrée",
    image: "/images/salade-mangue.jpg",
    label: "Végétarien",
  },
  {
    id: 2,
    name: "Poulet Braisé Signature",
    description: "Poulet mariné aux épices exotiques et braisé lentement",
    price: "12€",
    category: "Plat",
    image: "/images/poulet-braise.jfif",
    label: "Plat du chef",
  },
  {
    id: 3,
    name: "Cocktail Maison Infusé",
    description: "Cocktail frais aux fruits exotiques",
    price: "9€",
    category: "Boisson",
    image: "/images/cocktail.jpeg",
  },
  {
    id: 4,
    name: "Fondant au chocolat",
    description: "Dessert chaud avec cœur coulant au chocolat",
    price: "6€",
    category: "Dessert",
  },
];
