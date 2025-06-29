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
  id: 17,
  name: "Brochettes de viande (x5)",
  description: "Petites brochettes grillées, savoureuses et économiques",
  price: 1.900,
  category: "Entrées",
  image: "/assets/images/entree/brochettes-viande.png",
  details: "5 brochettes de viande tendres, parfaites pour une pause gourmande sans se ruiner."
},
{
  id: 18,
  name: "Tieb Boudienne au poisson",
  description: "Riz sénégalais au poisson et légumes",
  price: 8.90,
  category: "Plats",
  image: "/src/assets/images/plats/tieb-poisson.png",
  details: "Le classique sénégalais : du riz parfumé accompagné de poisson et de légumes bien mijotés.",
  complements: ["Riz blanc", "Riz sauté", "Frites de patate douce", "Attiéké", "Frites de plantain", "Chikwang", "Bâton de manioc"]
},
{
  id: 19,
  name: "Tieb Boudienne au poulet",
  description: "Riz sénégalais au poulet et légumes",
  price: 8.90,
  category: "Plats",
  image: "/src/assets/images/plats/tieb-poulet.png",
  details: "Une version savoureuse du Tieb au poulet, tendre et épicé, pour les amateurs de volaille.",
  complements: ["Riz blanc", "Riz sauté", "Frites de patate douce", "Attiéké", "Frites de plantain", "Chikwang", "Bâton de manioc"]
},
{
  id: 20,
  name: "Pintade braisée",
  description: "Pintade grillée lentement, saveurs intenses",
  price: 15.90,
  category: "Plats",
  image: "/src/assets/images/plats/pintade-braisee.png",
  details: "Volaille braisée à la perfection, croustillante à l’extérieur, juteuse à l’intérieur.",
  complements: ["Riz blanc", "Riz sauté", "Frites de patate douce", "Attiéké", "Frites de plantain", "Chikwang", "Bâton de manioc"]
},
{
  id: 21,
  name: "Soya",
  description: "Viande grillée à la camerounaise, épicée et savoureuse",
  price: 10.90,
  category: "Plats",
  image: "/src/assets/images/plats/soya.png",
  details: "Un incontournable du street food africain : lamelles de viande marinées, épicées et grillées au charbon.",
  complements: ["Riz blanc", "Riz sauté", "Frites de patate douce", "Attiéké", "Frites de plantain", "Chikwang", "Bâton de manioc"]
},
{
  id: 22,
  name: "Bokit Poulet",
  description: "Bokit garni de poulet, frit et croustillant",
  price: 10.90,
  category: "Plats",
  image: "/src/assets/images/plats/bokit-poulet.png",
  details: "Pain frit antillais généreusement garni de poulet, avec des compléments au choix."
  
},
{
  id: 23,
  name: "Bokit Morue",
  description: "Bokit à la morue bien assaisonnée",
  price: 10.90,
  category: "Plats",
  image: "/src/assets/images/plats/bokit-morue.png",
  details: "Une version marine du Bokit, à la morue épicée et moelleuse, croustillant et plein de caractère."
},
  {
  id: 20,
  name: "Degue",
  description: "Dessert traditionnel au mil et yaourt, frais et nourrissant",
  price: 2500,
  category: "Desserts",
  image: "/src/assets/images/Dessert/degue.png",
  details: "Un grand classique des desserts africains, crémeux et rafraîchissant."
},
{
  id: 21,
  name: "Sorbet",
  description: "Glace légère et fruitée pour une pause fraîcheur",
  price: 2500,
  category: "Desserts",
  image: "/src/assets/images/Dessert/sorbet.png",
  details: "Sorbet onctueux aux saveurs naturelles, idéal pour finir le repas en douceur."
},
{
  id: 22,
  name: "Jus de Baobab",
  description: "Boisson douce et onctueuse au fruit du baobab",
  price: 2500,
  category: "Desserts",
  image: "/src/assets/images/Dessert/baobab.png",
  details: "Un concentré d’énergie et de fraîcheur, naturellement riche en nutriments."
},
{
  id: 23,
  name: "Jus de Tamarin",
  description: "Boisson acidulée au tamarin, sucrée et désaltérante",
  price: 2500,
  category: "Desserts",
  image: "/src/assets/images/Dessert/jus-tamarin.png",
  details: "Une touche exotique et énergisante venue tout droit des saveurs africaines."
},
{
  id: 24,
  name: "Kossam",
  description: "Lait caillé traditionnel, frais et crémeux",
  price: 2500,
  category: "Desserts",
  image: "/src/assets/images/Dessert/juskossam.png",
  details: "Un incontournable du dessert africain, à savourer bien frais pour plus de plaisir."
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
    image: "assets/images/Boissons/orangina.jpg",
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
  // Ajouts de tes boissons mentionnées
  {
    id: 27,
    name: "Castel",
    description: "Bière blonde légère et rafraîchissante, parfaite pour les moments conviviaux",
    price: 3.00,
    category: "Boissons",
    image: "/assets/images/Boissons/castel.png",
    details: "La bière camerounaise incontournable, à déguster bien fraîche."
  },
  {
    id: 28,
    name: "Mutzig",
    description: "Bière premium au goût équilibré, très populaire en Afrique centrale",
    price: 3.00,
    category: "Boissons",
    image: "/assets/images/Boissons/mutzig.webp",
    details: "Une bière légère et savoureuse pour accompagner tous vos plats."
  },
  {
    id: 29,
    name: "Guinness",
    description: "Bière stout irlandaise au goût corsé et crémeux",
    price: 3.50,
    category: "Boissons",
    image: "/assets/images/Boissons/guiness.webp",
    details: "Une icône mondiale, parfaite pour les amateurs de bière noire."
  },
  {
    id: 30,
    name: "Vimto",
    description: "Boisson fruitée pétillante à base de fruits rouges",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/vimto.webp",
    details: "Un classique britannique apprécié pour son goût sucré et rafraîchissant."
  },
  {
    id: 31,
    name: "Djino",
    description: "Boisson énergétique à base de plantes africaines",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/djino.jpg",
    details: "Pour un coup de boost naturel et savoureux."
  },
  {
    id: 32,
    name: "Booster",
    description: "Boisson énergisante pour garder la pêche toute la journée",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/booster.jpeg",
    details: "Une formule tonique pour une énergie rapide."
  },
  {
    id: 33,
    name: "Kadji Bière",
    description: "Bière artisanale locale au goût authentique",
    price: 3.00,
    category: "Boissons",
    image: "/assets/images/Boissons/kadji.png",
    details: "Un savoir-faire brassicole pour une dégustation unique."
  },
  {
    id: 34,
    name: "33 Export",
    description: "Bière blonde très appréciée en Afrique, rafraîchissante et légère",
    price: 3.00,
    category: "Boissons",
    image: "/assets/images/Boissons/33export.png",
    details: "Un classique des bières africaines, parfaite pour vos moments festifs."
  },
  {
    id: 35,
    name: "Cola Champion",
    description: "Boisson gazeuse sucrée et rafraîchissante",
    price: 2.00,
    category: "Boissons",
    image: "/assets/images/Boissons/colachampion.png",
    details: "Un cola au goût authentique, très populaire localement."
  },
  {
    id: 36,
    name: "Eau de coco",
    description: "Boisson naturelle et désaltérante, directement issue de la noix de coco",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/eau-coco.png",
    details: "Parfait pour rester hydraté avec une touche exotique."
  },
  {
    id: 37,
    name: "Vitamalt",
    description: "Boisson maltée non alcoolisée, pleine de vitamines",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/vitamalt.png",
    details: "L’option gourmande et vitaminée pour petits et grands."
  },
  {
    id: 38,
    name: "Isembeck",
    description: "Bière locale artisanale au goût unique",
    price: 3.00,
    category: "Boissons",
    image: "/assets/images/Boissons/isembeck.png",
    details: "Brassée avec passion pour les amateurs de bière authentique."
  },
  {
    id: 39,
    name: "Malta Guinness",
    description: "Boisson maltée non alcoolisée à base de Guinness",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/maltaguinness.png",
    details: "Le goût Guinness en version douce et rafraîchissante."
  },
  {
    id: 40,
    name: "Malta Vanille",
    description: "Boisson maltée sucrée avec un soupçon de vanille",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/maltavanille.png",
    details: "Une douceur maltée qui séduit les palais gourmands."
  },
  {
    id: 41,
    name: "Fanta",
    description: "Boisson gazeuse fruitée à l’orange",
    price: 2.00,
    category: "Boissons",
    image: "/assets/images/Boissons/fanta.png",
    details: "Un classique pétillant et fruité pour rafraîchir vos journées."
  },
  {
    id: 42,
    name: "Jus de mangue",
    description: "Jus naturel de mangue, sucré et onctueux",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/jus-mangue.png",
    details: "Un goût exotique et sucré, parfait pour se rafraîchir."
  },
  {
    id: 43,
    name: "Jus de goyave",
    description: "Jus naturel de goyave, riche en saveurs",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/jus-goyave.png",
    details: "Un fruit tropical délicieux et vitaminé."
  },
  {
    id: 44,
    name: "Jus tropical",
    description: "Mélange de fruits tropicaux pour une explosion de saveurs",
    price: 2.50,
    category: "Boissons",
    image: "/assets/images/Boissons/jus-tropical.webp",
    details: "Un cocktail vitaminé pour un moment de fraîcheur."
  },
  {
  id: 44,
  name: "Thé bissap",
  description: "Verre de jus de bissap frais et sucré, servi bien frais",
  price: 1.00,
  category: "Boissons",
  image: "/assets/images/Boissons/verrebissap.png",
  details: "Infusé à base de fleurs d’hibiscus, riche en antioxydants et très rafraîchissant."
},
{
  id: 45,
  name: "Thé gingembre",
  description: "Boisson africaine épicée, tonifiante et servie fraîche",
  price: 1.00,
  category: "Boissons",
  image: "/assets/images/Boissons/the-gingembre.png",
  details: "Le célèbre ‘Gnamakoudji’ à base de gingembre frais pour booster l’énergie."
},
{
  id: 46,
  name: "Thé moringa",
  description: "Boisson naturelle aux bienfaits du moringa, légère et revitalisante",
  price: 1.00,
  category: "Boissons",
  image: "/assets/images/Boissons/jus-moringa.png",
  details: "Riche en vitamines et antioxydants, idéale pour une pause santé."
},
{
  id: 47,
  name: "Thé Citronnelle",
  description: "Infusion fraîche et parfumée de citronnelle, pour une sensation apaisante",
  price: 1.00,
  category: "Boissons",
  image: "/assets/images/Boissons/jus-citronnelle.png",
  details: "Saveur citronnée douce, parfaite pour se désaltérer en douceur."
},
{
  id: 48,
  name: "Thé Menthe",
  description: "Boisson rafraîchissante à la menthe, idéale pour les journées chaudes",
  price: 1.00,
  category: "Boissons",
  image: "/assets/images/Boissons/jus-menthe.png",
  details: "Saveur mentholée légère qui désaltère et rafraîchit instantanément."
},
  

  {
  id: 27,
  name: "Ndolé - Frites de plantain",
  description: "Feuilles d’amarante mijotées servies avec des frites de plantain croustillantes.",
  price: 13.20,
  category: "Spécial Weekend",
  image: "/images/special-weekend/ndole-frites-plantain.png",
  details: "Un plat classique alliant douceur et caractère pour un weekend aux saveurs du pays."
},
{
  id: 28,
  name: "Beignets Haricots Bouillie",
  description: "Trio populaire camerounais : beignets dorés, haricots fondants, bouillie onctueuse.",
  price: 9.50,
  category: "Spécial Weekend",
  image: "/images/special-weekend/beignets-haricots-bouillie.png",
  details: "Un petit-déjeuner de roi ou un brunch du weekend typique et réconfortant."
},
{
  id: 29,
  name: "Eru - Waterfufu",
  description: "Feuilles d’éru mijotées accompagnées de waterfufu tendre.",
  price: 12.50,
  category: "Spécial Weekend",
  image: "/images/special-weekend/eru-water-fufu.png",
  details: "Une spécialité du Sud-Ouest Cameroun riche en goût et en tradition."
},
{
  id: 30,
  name: "Sauce Gombo - Fufu Manioc",
  description: "Sauce gombo glissante et parfumée servie avec du fufu de manioc.",
  price: 11.90,
  category: "Spécial Weekend",
  image: "/images/special-weekend/sauce-gombo-fufu-manioc.png",
  details: "Un plat généreux et typique aux textures uniques, très apprécié au pays."
},
{
  id: 31,
  name: "Banane malaxée - Mouton ou chèvre",
  description: "Purée de banane salée servie avec une viande de mouton ou de chèvre en sauce.",
  price: 13.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/banane-malaxee-mouton.png",
  details: "Un plat ancré dans la tradition, savoureux et consistant pour bien terminer la semaine."
},
{
  id: 32,
  name: "Bouillon de pieds de bœuf - Manioc ou plantain",
  description: "Bouillon parfumé de pieds de bœuf servi avec manioc ou plantain cuit vapeur.",
  price: 12.80,
  category: "Spécial Weekend",
  image: "/images/special-weekend/toto.png",
  details: "Un plat riche en collagène et en arômes pour les amateurs de cuisine authentique."
},
{
  id: 33,
  name: "Taro - Sauce Jaune",
  description: "Taro pilé accompagné d’une sauce jaune bien relevée.",
  price: 12.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/taro-sauce-jaune.png",
  details: "Un incontournable du terroir camerounais, parfait pour les grandes occasions."
},
{
  id: 34,
  name: "Mbongo Tchobi-Plantain Mur ou cuit a la vapeur ",
  description: "Poisson mijoté dans une sauce noire aux épices brûlées.",
  price: 13.50,
  category: "Spécial Weekend",
  image: "/images/special-weekend/mbongo-tchobi.png",
  details: "Plat emblématique de la région Bassa, intense et envoûtant."
},
{
  id: 35,
  name: "Ndomba de poisson",
  description: "Poisson mariné et cuit dans des feuilles, aux épices douces et parfumées.",
  price: 13.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/ndomba-poisson.png",
  details: "Une cuisson lente et naturelle pour un goût irrésistiblement fumé."
},
{
  id: 36,
  name: "Okok Eton - Manioc vapeur ou bâton",
  description: "Okok (feuilles d’essong) accompagné de manioc vapeur ou bâton traditionnel.",
  price: 11.80,
  category: "Spécial Weekend",
  image: "/images/special-weekend/okok-manioc.png",
  details: "Plat traditionnel des Eton, riche en goût et en souvenirs familiaux."
},
{
  id: 37,
  name: "Koki - Banane",
  description: "Koki à base de niébé, servi avec de la banane cuite à la vapeur.",
  price: 11.50,
  category: "Spécial Weekend",
  image: "/images/special-weekend/koki-banane.png",
  details: "Un plat emblématique aux saveurs douces et onctueuses, 100% camerounais."
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
