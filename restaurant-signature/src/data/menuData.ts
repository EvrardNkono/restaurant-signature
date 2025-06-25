// data/menuData.ts
import type { Dish } from './types';

const menuData: Dish[] = [
  {
    id: 1,
    name: "Salade exotique",
    description: "Mélange frais de mangue, avocat et crevettes",
    price: 8.40,
    category: "Entrées",
    image: "/assets/images/entree/salade-exotique.png",
    details: "Une entrée légère et colorée aux saveurs tropicales, parfaite pour éveiller les papilles."
  },
  {
    id: 2,
    name: "Accras de morue",
    description: "Beignets croustillants de morue aux épices antillaises",
    price: 6.10,
    category: "Entrées",
    image: "/assets/images/entree/accras-morue.png",
    details: "Frits à la perfection, ces accras sont une explosion d’épices et de tradition créole."
  },
  {
    id: 3,
    name: "Tartare de thon",
    description: "Thon frais coupé au couteau, agrémenté d’une vinaigrette citronnée",
    price: 10.70,
    category: "Entrées",
    image: "/assets/images/entree/tartare-thon.png",
    details: "Fraîcheur marine et acidité équilibrée pour un démarrage raffiné."
  },
  {
    id: 4,
    name: "Soupe de patate douce",
    description: "Velouté onctueux aux épices douces et lait de coco",
    price: 6.90,
    category: "Entrées",
    image: "/assets/images/entree/soupe-patate-douce.png",
    details: "Un concentré de douceur et d’arômes qui réchauffe le corps et le cœur."
  },
  {
    id: 5,
    name: "Brochettes de poulet mariné",
    description: "Poulet grillé au paprika et citron vert",
    price: 7.60,
    category: "Entrées",
    image: "/assets/images/entree/brochettes-poulet.png",
    details: "Saveurs fumées et acidulées pour une entrée gourmande et généreuse."
  },
  {
    id: 6,
    name: "Salade de papaye verte",
    description: "Papaye râpée, cacahuètes grillées et piment doux",
    price: 7.90,
    category: "Entrées",
    image: "/assets/images/entree/salade-papaye.png",
    details: "Une entrée fraîche et croquante avec une pointe de piquant maîtrisée."
  },
  {
    id: 7,
    name: "Ceviche de poisson",
    description: "Poisson blanc mariné au citron vert, coriandre et oignon rouge",
    price: 11.50,
    category: "Entrées",
    image: "/assets/images/entree/ceviche-poisson.png",
    details: "Alliance parfaite entre acidité et fraîcheur pour un plaisir gustatif intense."
  },
  {
    id: 8,
    name: "Samoussas aux légumes",
    description: "Triangles croustillants farcis aux légumes épicés",
    price: 6.40,
    category: "Entrées",
    image: "/assets/images/entree/samoussas-legumes.png",
    details: "Une bouchée croustillante et parfumée, idéale pour débuter le repas."
  },
  {
    id: 9,
    name: "Terrine de légumes",
    description: "Terrine colorée aux légumes de saison et herbes fraîches",
    price: 8.90,
    category: "Entrées",
    image: "/assets/images/entree/terrine-legumes.png",
    details: "Subtil mélange de textures et de saveurs naturelles, délicatement relevé."
  },
  {
    id: 10,
    name: "Salade de concombre et menthe",
    description: "Concombre frais, menthe, citron et une touche de yaourt",
    price: 6.10,
    category: "Entrées",
    image: "/assets/images/entree/salade-concombre.png",
    details: "Une entrée rafraîchissante, légère et pleine de vitalité."
  },
  {
    id: 11,
    name: "Beignets de banane plantain",
    description: "Plantains mûrs frits, croustillants à l’extérieur et fondants à l’intérieur",
    price: 6.90,
    category: "Entrées",
    image: "/scr/assets/images/entree/beignets-plantain.png",
    details: "Douceur tropicale et gourmandise dans chaque bouchée dorée."
  },
  {
    id: 12,
    name: "Salade de chou créole",
    description: "Chou finement râpé, carottes, oignons et sauce vinaigrette relevée",
    price: 7.20,
    category: "Entrées",
    image: "/assets/images/entree/salade-chou.png",
    details: "Un classique créole frais et croquant, parfait pour démarrer en légèreté."
  },
  {
    id: 13,
    name: "Crabe farci",
    description: "Crabe décortiqué, épices et fines herbes, gratiné au four",
    price: 12.20,
    category: "Entrées",
    image: "/assets/images/entree/crabe-farci.png",
    details: "Un délice riche et savoureux pour les amateurs de fruits de mer."
  },
  {
    id: 14,
    name: "Soupe froide de concombre",
    description: "Velouté rafraîchissant à base de concombre et yaourt grec",
    price: 6.60,
    category: "Entrées",
    image: "/assets/images/entree/soupe-concombre.png",
    details: "Une entrée légère et désaltérante, idéale pour les journées chaudes."
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
    name: "Tarte à la mangue",
    description: "Tarte fine à la mangue fraîche, légère et sucrée",
    price: 3_500,
    category: "Desserts",
    image: "/assets/images/tarte-mangue.png",
    details: "Un dessert ensoleillé à la pâte croustillante et à la douceur fruitée."
  },
  {
    id: 18,
    name: "Flan coco",
    description: "Flan onctueux à la noix de coco parfumée",
    price: 3_000,
    category: "Desserts",
    image: "/assets/images/flan-coco.png",
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


];

export default menuData;
