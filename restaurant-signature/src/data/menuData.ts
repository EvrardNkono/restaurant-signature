// data/menuData.ts
import type { Dish } from './types';

const menuData: Dish[] = [
  {
    id: 1,
    name: "Salade exotique",
    description: "Mélange frais de mangue, avocat et crevettes",
    price: 8.40,
    category: "Entrées",
    image: "/src/assets/images/entree/salade-exotique.png",
    details: "Une entrée légère et colorée aux saveurs tropicales, parfaite pour éveiller les papilles."
  },
  {
    id: 2,
    name: "Salade signature",
    description: "Salade fraîche au poulet, avocat, maïs et laitue croquante, ensoleillée.",
    price: 6.10,
    category: "Entrées",
    image: "/src/assets/images/entree/salade-signature.png",
    details: "Salade fraîche aux feuilles de laitue, poulet grillé émietté, avocat et maïs doux. Une entrée légère, colorée et pleine de saveurs."
  },
  {
    id: 3,
    name: "Memaya Gourmette",
    description: "La gourmandise n'a jamais ete aussi intense",
    price: 10.70,
    category: "Entrées",
    image: "/src/assets/images/entree/memaya-gourmette.png",
    details: "Gésier de poulet grillé tendre, servi sur un lit de feuilles de laitue croquantes : un plat savoureux, léger et riche en protéines."
  },
  {
    id: 4,
    name: "Fraîcheur exotique",
    description: "Salade fraîche, laitue vapeur, maïs doux et poisson grillé.",
    price: 6.90,
    category: "Entrées",
    image: "/src/assets/images/entree/fraîcheur-exotique.png",
    details: "Salade fraîche aux feuilles de laitue vapeur, maïs doux croquant et poisson grillé savoureux, un mariage léger et plein de fraîcheur.."
  },
  {
    id: 5,
    name: "Samoussa et Salade",
    description: "Samoussa croustillant avec salade fraîche et croquante.",
    price: 7.60,
    category: "Entrées",
    image: "/src/assets/images/entree/samoussaetsalade.webp",
    details: "Samoussa croustillant accompagné d'une salade fraîche et colorée, un duo gourmand qui réveille les papilles avec saveur et légèreté."
  },
  {
    id: 6,
    name: "Tendredde du Mboa",
    description: "Salade fraîche, poisson grillé, avocat crémeux et maïs doux.",
    price: 7.90,
    category: "Entrées",
    image: "/src/assets/images/entree/TendresseDUMBOA.png",
    details: "Salade fraîche et colorée, avec poisson grillé émietté, avocat crémeux et maïs doux, pour un équilibre parfait entre saveurs et textures légères."
  },
  {
    id: 7,
    name: "Triot vegetal",
    description: "Poisson blanc mariné au citron vert, coriandre et oignon rouge",
    price: 11.50,
    category: "Entrées",
    image: "/src/assets/images/entree/triovegetal.png",
    details: "Alliance parfaite entre acidité et fraîcheur pour un plaisir gustatif intense."
  },
  {
    id: 8,
    name: "Pastel et Salade",
    description: "Pastel croustillant avec salade fraîche, un combo savoureux et léger à déguster.",
    price: 6.40,
    category: "Entrées",
    image: "/src/assets/images/entree/pastel-salade.png",
    details: "Pastel doré et croustillant, accompagné d'une salade fraîche et croquante, pour une explosion de saveurs à chaque bouchée, simple et savoureuse."
  },
  {
    id: 9,
    name: "Beignets d'acra et Salade",
    description: "Acra croustillants avec salade fraîche et pleine de peps.",
    price: 8.90,
    category: "Entrées",
    image: "/src/assets/images/entree/BeignetsacraSalade.png",
    details: "Beignets d’acra dorés et épicés servis avec une salade croquante et fraîche pour une entrée pleine de peps et de saveurs exotiques."
  },
  
  {
    id: 15,
    name: "Poulet Colombo",
    description: "Poulet mijoté aux épices Colombo et légumes frais",
    price: 8_000,
    category: "Plats",
    image: "/assets/images/poulet-colombo.png",
    details: "Un plat emblématique des Antilles, relevé, parfumé, et tendre à souhait."
  },
  {
    id: 16,
    name: "Cabri massalé",
    description: "Cabri épicé à la mode réunionnaise",
    price: 9_500,
    category: "Plats",
    image: "/assets/images/entree/cabri-massale.png",
    details: "Un voyage direct à La Réunion avec ce plat intense et authentique."
  },
  {
    id: 17,
    name: "SALADE EXOTIQUE",
    description: "Tarte fine à la mangue fraîche, légère et sucrée",
    price: 3_500,
    category: "Desserts",
    image: "/assets/images/Dessert/tarte-mangue.png",
    details: "Un dessert ensoleillé à la pâte croustillante et à la douceur fruitée."
  },
  {
    id: 18,
    name: "Tendresse DU MBOA",
    description: "Flan onctueux à la noix de coco parfumée",
    price: 3_000,
    category: "Desserts",
    image: "/assets/images/Dessert/TendresseDUMBOA.png",
    details: "Crémeux et exotique, un classique des îles à savourer bien frais."
  },
  {
    id: 17,
    name: "Triot vegetal croquant",
    description: "Tarte fine à la mangue fraîche, légère et sucrée",
    price: 3_500,
    category: "Desserts",
    image: "/assets/images/Dessert/triovegetal.png",
    details: "Un dessert ensoleillé à la pâte croustillante et à la douceur fruitée."
  },
  {
    id: 18,
    name: "Tendresse DU MBOA",
    description: "Flan onctueux à la noix de coco parfumée",
    price: 3_000,
    category: "Desserts",
    image: "/assets/images/Dessert/TendresseDUMBOA.png",
    details: "Crémeux et exotique, un classique des îles à savourer bien frais."
  },
  {
    id: 19,
    name: "Jus de bissap",
    description: "Verre de jus de bissap frais et sucré, servi bien frais",
    price: 2.00,
    category: "Boissons",
    image: "assets/images/Boissons/verrebissap.png",
    details: "Infusé à base de fleurs d’hibiscus, riche en antioxydants et très rafraîchissant."
  },
  {
    id: 20,
    name: "Coca-Cola",
    description: "Boisson gazeuse rafraîchissante, servie bien fraîche",
    price: 2.00,
    category: "Boissons",
    image: "assets/images/Boissons/cocacola.png",
    details: "La boisson pétillante classique, toujours servie bien fraîche pour étancher la soif."
  },
  {
    id: 21,
    name: "Orangina",
    description: "Boisson pétillante à l'orange avec pulpe",
    price: 2.00,
    category: "Boissons",
    image: "assets/images/Boissons/orangina.png",
    details: "Le goût unique de l’orange avec pulpe, pour une pause pleine de pep’s."
  },
  {
    id: 22,
    name: "Schweppes Agrum'",
    description: "Boisson gazeuse au goût d’agrumes",
    price: 2.00,
    category: "Boissons",
    image: "assets/images/Boissons/schweppes.png",
    details: "Un mélange d’agrumes acidulé et tonique, avec des bulles pleines de caractère."
  },
  {
    id: 23,
    name: "Jus de Baobab",
    description: "Boisson naturelle à base de fruit du baobab, rafraîchissante et vitaminée",
    price: 2.50,
    category: "Boissons",
    image: "assets/images/Boissons/jus-baobab.png",
    details: "Riche en vitamines C et fibres, ce jus africain vous reconnecte à la nature."
  },
  {
    id: 24,
    name: "Thé au clou de girofle",
    description: "Infusion chaude et épicée aux clous de girofle",
    price: 2.00,
    category: "Boissons",
    image: "assets/images/Boissons/the-girofle.png",
    details: "Parfait après un repas, ce thé digestif est un remède ancestral au goût intense."
  },
  {
    id: 25,
    name: "Jus de gingembre",
    description: "Boisson africaine épicée, tonifiante et servie fraîche",
    price: 2.00,
    category: "Boissons",
    image: "assets/images/Boissons/jus-gingembre.png",
    details: "Le célèbre ‘Gnamakoudji’ à base de gingembre frais pour booster l’énergie."
  },
  {
    id: 26,
    name: "Ice Tea Pêche",
    description: "Thé glacé à la pêche, doux et désaltérant",
    price: 2.00,
    category: "Boissons",
    image: "assets/images/Boissons/icetea-peche.png",
    details: "La douceur de la pêche combinée à la fraîcheur du thé glacé, pour une pause zen."
  },

  {
  id: 27,
  name: "Eru - Water Fufu",
  description: "Feuilles d’éru mijotées avec water fufu moelleux, un classique du Cameroun.",
  price: 12.50,
  category: "Spécial Weekend",
  image: "/assets/images/special-weekend/eru-water-fufu.png",
  details: "Un plat riche en saveurs, parfait pour un weekend réconfortant et authentique."
},
{
  id: 28,
  name: "Okok - Bâton de Manioc",
  description: "Okok frais accompagné de bâton de manioc, recette traditionnelle et savoureuse.",
  price: 11.80,
  category: "Spécial Weekend",
  image: "/assets/images/special-weekend/okok-baton-manioc.png",
  details: "Une alliance de textures et de goûts pour les amoureux de la cuisine africaine."
},
{
  id: 29,
  name: "Ndolé - Plantain mûr",
  description: "Feuilles d’amarante (Ndolé) avec plantains mûrs frits, un incontournable du terroir.",
  price: 13.20,
  category: "Spécial Weekend",
  image: "/assets/images/special-weekend/ndole-plantain-mur.png",
  details: "Un plat équilibré, riche et légèrement sucré grâce au plantain."
},
{
  id: 30,
  name: "Taro - Sauce Jaune",
  description: "Taro local accompagné d’une sauce jaune épicée et onctueuse.",
  price: 12.00,
  category: "Spécial Weekend",
  image: "/assets/images/special-weekend/taro-sauce-jaune.png",
  details: "Un mariage de saveurs épicées et terreuses pour une expérience unique."
},
{
  id: 31,
  name: "Poulet DG",
  description: "Poulet braisé aux légumes, un plat festif et délicieux pour le weekend.",
  price: 14.50,
  category: "Spécial Weekend",
  image: "/assets/images/special-weekend/poulet-dg.png",
  details: "Un classique apprécié qui réunit saveurs et convivialité."
},

// Ajout à ton tableau menuData
{
  id: 1001,
  name: "Poulet du Chef",
  description: "Poulet mijoté ou grillé, préparé avec soin selon l'inspiration du Chef.",
  price: 8.0,
  category: "Concept du Chef",
  image: "/assets/images/concept/poulet.png",
  details: "Un classique réinventé, servi avec votre choix de sauce et d’accompagnement."
},
{
  id: 1002,
  name: "Poisson du Chef",
  description: "Poisson savoureux et fondant, sublimé par une touche exotique du Chef.",
  price: 8.0,
  category: "Concept du Chef",
  image: "/assets/images/concept/poisson.png",
  details: "Une option fraîche et légère, à composer selon vos envies."
}




];

export default menuData;
