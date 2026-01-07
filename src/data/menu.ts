// data/menu.ts

export interface Plat {
  id: number;
  name: string;
  description: string;
  price: string;
  category: "Entrée" | "Plat" | "Dessert" | "Boisson" | "Formule"; // Ajout de "Formule"
  image?: string; 
  label?: "Végétarien" | "Épicé" | "Plat du chef";
}

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
  {
    id: 5,
    name: "Samoussa, Salade et sauce tomate",
    description: "Samoussa croustillant avec salade fraîche et croquante.",
    price: "8.90",
    category: "Entrée",
    image: "/src/assets/images/entree/samoussaetsalade.webp",
  },
  {
    id: 6,
    name: "Tendresse du Mboa",
    description: "Salade fraîche, poisson grillé, avocat crémeux et maïs doux.",
    price: "8.90",
    category: "Entrée",
    image: "/src/assets/images/entree/TendresseDUMBOA.png",
  },
  {
    id: 8,
    name: "Pastel et Salade",
    description: "Pastel croustillant avec salade fraîche, un combo savoureux et léger à déguster.",
    price: "8.90",
    category: "Entrée",
    image: "/src/assets/images/entree/pastel-salade.png",
  },
  {
    id: 9,
    name: "Beignets d'acra et Salade",
    description: "Acra croustillants avec salade fraîche et pleine de peps.",
    price: "8.90",
    category: "Entrée",
    image: "/src/assets/images/entree/BeignetsacraSalade.png",
  },
  {
    id: 20,
    name: "Pintade braisée",
    description: "Pintade grillée lentement, saveurs intenses",
    price: "15.9",
    category: "Plat",
    image: "/src/assets/images/plats/pintade-braisee.png",
  },
  {
    id: 205,
    name: "Poulet braisé",
    description: "Poulet croustillant à l’extérieur, juteux à l’intérieur",
    price: "10.9",
    category: "Plat",
    image: "/src/assets/images/plats/poulet-braise.png",
  },
  {
    id: 24,
    name: "Brochettes de viande X4",
    description: " 4 Brochettes de viande grillés, marinés aux épices",
    price: "10.0",
    category: "Plat",
    image: "/src/assets/images/plats/soya.png",
  },
  {
    id: 250,
    name: "Porc braisé",
    description: "Porc braisé croustillant à l’extérieur et fondant à l’intérieur",
    price: "10.9",
    category: "Plat",
    image: "/src/assets/images/plats/porc_braise.png",
  },
  {
    id: 206, // ID corrigé (était doublon de 205)
    name: "Ntaba braisé",
    description: "Chèvre grillée au feu de bois, aux saveurs africaines authentiques",
    price: "10.9",
    category: "Plat",
    image: "/src/assets/images/plats/ntaba.webp",
  },
  {
    id: 22,
    name: "Dorade Moyenne braisée",
    description: "Dorade entière, grillée façon camerounaise",
    price: "15.9",
    category: "Plat",
    image: "/src/assets/images/plats/dorade-braisee.png",
  },
  {
    id: 222, // ID corrigé (était doublon de 22)
    name: " Grosse Dorade braisée",
    description: "Dorade entière, grillée façon camerounaise",
    price: "20.9",
    category: "Plat",
    image: "/src/assets/images/plats/dorade-braisee.png",
  },
  {
    id: 23,
    name: "Maquereau Oya-Oya Moyen",
    description: "Maquereau épicé façon Oya-Oya, grillé au feu de bois",
    price: "15.9",
    category: "Plat",
    image: "/src/assets/images/plats/poisson-braise.png",
  },
  {
    id: 233, // ID corrigé (était doublon de 23)
    name: "Gros Maquereau Oya-Oya",
    description: "Maquereau épicé façon Oya-Oya, grillé au feu de bois",
    price: "20.9",
    category: "Plat",
    image: "/src/assets/images/plats/poisson-braise.png",
  },
  {
    id: 4630,
    name: "Shandwich pain viande",
    description: "Pain garni de viande savoureuse, façon snack gourmand",
    price: "5.00",
    category: "Plat",
    image: "/src/assets/images/plats/chandwich-viande.png",
  },
  {
    id: 2222, // ID corrigé
    name: "Bokit Poulet",
    description: "Bokit garni de poulet, frit et croustillant",
    price: "10.9",
    category: "Plat",
    image: "/src/assets/images/plats/bokit-poulet.png",
  },
  {
    id: 2333, // ID corrigé
    name: "Bokit Morue",
    description: "Bokit à la morue bien assaisonnée",
    price: "10.9",
    category: "Plat",
    image: "/src/assets/images/plats/bokit-morue.png",
  },
  {
    id: 18,
    name: "Tieb Boudienne au poisson",
    description: "Riz sénégalais au poisson et légumes",
    price: "10.0",
    category: "Plat",
    image: "/src/assets/images/plats/tieb-poisson.png",
  },
  {
    id: 19,
    name: "Tieb Boudienne au poulet",
    description: "Riz sénégalais au poulet et légumes",
    price: "10.0",
    category: "Plat",
    image: "/src/assets/images/plats/tieb-poulet.png",
  },
  {
    id: 200, // ID corrigé (était doublon de 20)
    name: "Degue",
    description: "Dessert traditionnel au mil et yaourt, frais et nourrissant",
    price: "3.90",
    category: "Dessert",
    image: "/src/assets/images/Dessert/degue.png",
  },

  /* --- FORMULES --- */
  {
    id: 500,
    name: "Formule Complète",
    description: "La totale : Entrée + Plat + Dessert au choix parmi notre sélection.",
    price: "24.90",
    category: "Formule",
    label: "Plat du chef"
  },
  {
    id: 501,
    name: "Formule Midi (Entrée + Plat)",
    description: "Idéal pour un déjeuner rapide : Une entrée fraîche suivie de votre plat favori.",
    price: "18.50",
    category: "Formule"
  },
  {
    id: 502,
    name: "Formule Gourmande (Plat + Dessert)",
    description: "Pour les plus gourmands : Votre plat Signature accompagné d'une douceur.",
    price: "18.50",
    category: "Formule"
  }
];