// data/menuSoir.ts

export interface Plat {
  id: number;
  name: string;
  description: string;
  price: string;
  category: "Entrée" | "Plat" | "Dessert" | "Boisson" | "Formule"; // Mis à jour
  image?: string;
  label?: "Végétarien" | "Épicé" | "Plat du chef";
}

export const carteSoir: Plat[] = [
  {
    id: 1,
    name: "Salade de mangue exotique",
    description: "Mangue fraîche, avocat, coriandre et citron vert",
    price: "7.00",
    category: "Entrée",
    image: "/images/salade-mangue.jpg",
    label: "Végétarien",
  },
  {
    id: 2,
    name: "Poulet Braisé Signature",
    description: "Poulet mariné aux épices exotiques et braisé lentement",
    price: "12.00",
    category: "Plat",
    image: "/images/poulet-braise.jfif",
    label: "Plat du chef",
  },
  {
    id: 3,
    name: "Cocktail Maison Infusé",
    description: "Cocktail frais aux fruits exotiques",
    price: "9.00",
    category: "Boisson",
    image: "/images/cocktail.jpeg",
  },
  {
    id: 4,
    name: "Fondant au chocolat",
    description: "Dessert chaud avec cœur coulant au chocolat",
    price: "6.00",
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
    price: "15.90",
    category: "Plat",
    image: "/src/assets/images/plats/pintade-braisee.png",
  },
  {
    id: 205,
    name: "Poulet braisé",
    description: "Poulet croustillant à l’extérieur, juteux à l’intérieur",
    price: "10.90",
    category: "Plat",
    image: "/src/assets/images/plats/poulet-braise.png",
  },
  {
    id: 24,
    name: "Brochettes de viande X4",
    description: "4 Brochettes de viande grillées, marinées aux épices",
    price: "10.00",
    category: "Plat",
    image: "/src/assets/images/plats/soya.png",
  },
  {
    id: 250,
    name: "Porc braisé",
    description: "Porc braisé croustillant à l’extérieur et fondant à l’intérieur",
    price: "10.90",
    category: "Plat",
    image: "/src/assets/images/plats/porc_braise.png",
  },
  {
    id: 206,
    name: "Ntaba braisé",
    description: "Chèvre grillée au feu de bois, aux saveurs africaines authentiques",
    price: "10.90",
    category: "Plat",
    image: "/src/assets/images/plats/ntaba.webp",
  },
  {
    id: 22,
    name: "Dorade Moyenne braisée",
    description: "Dorade entière, grillée façon camerounaise",
    price: "15.90",
    category: "Plat",
    image: "/src/assets/images/plats/dorade-braisee.png",
  },
  {
    id: 222,
    name: "Grosse Dorade braisée",
    description: "Dorade entière, grillée façon camerounaise",
    price: "20.90",
    category: "Plat",
    image: "/src/assets/images/plats/dorade-braisee.png",
  },
  {
    id: 23,
    name: "Maquereau Oya-Oya Moyen",
    description: "Maquereau épicé façon Oya-Oya, grillé au feu de bois",
    price: "15.90",
    category: "Plat",
    image: "/src/assets/images/plats/poisson-braise.png",
  },
  {
    id: 233,
    name: "Gros Maquereau Oya-Oya",
    description: "Maquereau épicé façon Oya-Oya, grillé au feu de bois",
    price: "20.90",
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
    id: 224,
    name: "Bokit Poulet",
    description: "Bokit garni de poulet, frit et croustillant",
    price: "10.90",
    category: "Plat",
    image: "/src/assets/images/plats/bokit-poulet.png",
  },
  {
    id: 234,
    name: "Bokit Morue",
    description: "Bokit à la morue bien assaisonnée",
    price: "10.90",
    category: "Plat",
    image: "/src/assets/images/plats/bokit-morue.png",
  },
  {
    id: 18,
    name: "Tieb Boudienne au poisson",
    description: "Riz sénégalais au poisson et légumes",
    price: "10.00",
    category: "Plat",
    image: "/src/assets/images/plats/tieb-poisson.png",
  },
  {
    id: 19,
    name: "Tieb Boudienne au poulet",
    description: "Riz sénégalais au poulet et légumes",
    price: "10.00",
    category: "Plat",
    image: "/src/assets/images/plats/tieb-poulet.png",
  },
  {
    id: 21,
    name: "Degue",
    description: "Dessert traditionnel au mil et yaourt, frais et nourrissant",
    price: "3.90",
    category: "Dessert",
    image: "/src/assets/images/Dessert/degue.png",
  },

  /* --- FORMULES DU SOIR --- */
  {
    id: 900,
    name: "L'Éveil des Sens (Entrée + Plat + Dessert)",
    description: "Le menu gastronomique complet pour une immersion totale dans notre savoir-faire.",
    price: "35.00",
    category: "Formule",
    label: "Plat du chef"
  },
  {
    id: 901,
    name: "Prélude Nocturne (Entrée + Plat)",
    description: "Une entrée délicate suivie d'un plat de résistance braisé à la perfection.",
    price: "28.00",
    category: "Formule"
  },
  {
    id: 902,
    name: "Douceur de Nuit (Plat + Dessert)",
    description: "Le choix parfait pour finir sur une note sucrée après notre plat Signature.",
    price: "26.00",
    category: "Formule"
  }
];