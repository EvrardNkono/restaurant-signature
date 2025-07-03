// data/menuData.ts
import type { Dish } from './types';

const menuData: Dish[] = [
  {
    id: 1,
    name: "Salade exotique",
    description: "Mélange frais de mangue, avocat et crevettes",
    price: 8.90,
    category: "Entrées",
    image: "/src/assets/images/entree/salade-exotique.png",
    details: "Une entrée légère et colorée aux saveurs tropicales, parfaite pour éveiller les papilles."
  },
  {
    id: 2,
    name: "Salade signature",
    description: "Salade fraîche au poulet, avocat, maïs et laitue croquante, ensoleillée.",
    price: 8.90,
    category: "Entrées",
    image: "/src/assets/images/entree/salade-signature.png",
    details: "Salade fraîche aux feuilles de laitue, poulet grillé émietté, avocat et maïs doux. Une entrée légère, colorée et pleine de saveurs."
  },
  {
    id: 3,
    name: "Memaya Gourmette",
    description: "La gourmandise n'a jamais ete aussi intense",
    price: 8.90,
    category: "Entrées",
    image: "/src/assets/images/entree/memaya-gourmette.png",
    details: "Gésier de poulet grillé tendre, servi sur un lit de feuilles de laitue croquantes : un plat savoureux, léger et riche en protéines."
  },
  /*{
    id: 4,
    name: "Fraîcheur exotique",
    description: "Salade fraîche, laitue vapeur, maïs doux et poisson grillé.",
    price: 6.90,
    category: "Entrées",
    image: "/src/assets/images/entree/fraîcheur-exotique.png",
    details: "Salade fraîche aux feuilles de laitue vapeur, maïs doux croquant et poisson grillé savoureux, un mariage léger et plein de fraîcheur.."
  },*/
  {
    id: 5,
    name: "Samoussa et Salade",
    description: "Samoussa croustillant avec salade fraîche et croquante.",
    price: 8.90,
    category: "Entrées",
    image: "/src/assets/images/entree/samoussaetsalade.webp",
    details: "Samoussa croustillant accompagné d'une salade fraîche et colorée, un duo gourmand qui réveille les papilles avec saveur et légèreté."
  },
  {
    id: 6,
    name: "Tendresse du Mboa",
    description: "Salade fraîche, poisson grillé, avocat crémeux et maïs doux.",
    price: 8.90,
    category: "Entrées",
    image: "/src/assets/images/entree/TendresseDUMBOA.png",
    details: "Salade fraîche et colorée, avec poisson grillé émietté, avocat crémeux et maïs doux, pour un équilibre parfait entre saveurs et textures légères."
  },
  
  {
    id: 8,
    name: "Pastel et Salade",
    description: "Pastel croustillant avec salade fraîche, un combo savoureux et léger à déguster.",
    price: 8.90,
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
  id: 18,
  name: "Tieb Boudienne au poisson",
  description: "Riz sénégalais au poisson et légumes",
  price: 10.00,
  category: "Plats",
  image: "/src/assets/images/plats/tieb-poisson.png",
  details: "Le classique sénégalais : du riz parfumé accompagné de poisson et de légumes bien mijotés.",
 
},

{
  id: 4630, // Choisis un ID unique qui ne clash pas avec les autres
  name: "Shandwich pain viande",
  description: "Pain garni de viande savoureuse, façon snack gourmand",
  price: 5.00,
  category: "Plats",
  image: "/src/assets/images/plats/chandwich-viande.png",
  details: "Un en-cas copieux : pain croustillant garni de viande marinée, idéal pour combler les petites faims."
},

{
  id: 19,
  name: "Tieb Boudienne au poulet",
  description: "Riz sénégalais au poulet et légumes",
  price: 10.00,
  category: "Plats",
  image: "/src/assets/images/plats/tieb-poulet.png",
  details: "Une version savoureuse du Tieb au poulet, tendre et épicé, pour les amateurs de volaille.",
 
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
  id: 22,
  name: "Dorade braisée",
  description: "Dorade entière, grillée façon camerounaise",
  price: 15.90,
  category: "Plats",
  image: "/src/assets/images/plats/dorade-braisee.png",
  details: "Dorade fraîche braisée aux herbes et épices africaines, avec une peau dorée et une chair fondante.",
  complements: ["Frites de plantain", "Atieke", "Chikwang", "Baton de manioc",]
},
{
  id: 23,
  name: "Maquereau Oya-Oya",
  description: "Maquereau épicé façon Oya-Oya, grillé au feu de bois",
  price: 15.90,
  category: "Plats",
  image: "/src/assets/images/plats/poisson-braise.png",
  details: "Recette maison typique : maquereau braisé avec une marinade pimentée, signature de la street food d’Afrique de l’Ouest.",
  complements: ["Frites de plantain", "Atieke", "Chikwang", "Baton de manioc",]
},

{
  id: 24,
  name: "Brochettes de viande X4",
  description: " 4 Brochettes de viande grillés, marinés aux épices",
  price: 10.00,
  category: "Plats",
  image: "/src/assets/images/plats/soya.png",
  details: "De savoureuses brochettes de viande tendres et juteuses, grillées à la braise avec une marinade relevée à souhait.",
  complements: ["Frites de plantain", "Attiéké", "Chikwang", "Bâton de manioc",]
},

{
  id: 22,
  name: "Bokit Poulet",
  description: "Bokit garni de poulet, frit et croustillant",
  price: 10.90,
  category: "Plats",
  image: "/src/assets/images/plats/bokit-poulet.png",
  details: "Pain frit antillais généreusement garni de poulet, avec des compléments au choix.",
  complements: ["Frittes de plantain","Frittes de patates douces"]
  
},
{
  id: 23,
  name: "Bokit Morue",
  description: "Bokit à la morue bien assaisonnée",
  price: 10.90,
  category: "Plats",
  image: "/src/assets/images/plats/bokit-morue.png",
  details: "Une version marine du Bokit, à la morue épicée et moelleuse, croustillant et plein de caractère.",
  complements: ["Frittes de plantain","Frittes de patates douces"]
},
  {
  id: 20,
  name: "Degue",
  description: "Dessert traditionnel au mil et yaourt, frais et nourrissant",
  price: 3.90,
  category: "Desserts",
  image: "/src/assets/images/Dessert/degue.png",
  details: "Un grand classique des desserts africains, crémeux et rafraîchissant."
},
/*{
  id: 21,
  name: "Sorbet",
  description: "Glace légère et fruitée pour une pause fraîcheur",
  price: 1.00,
  category: "Desserts",
  image: "/src/assets/images/Dessert/sorbet.png",
  details: "Sorbet onctueux aux saveurs naturelles, idéal pour finir le repas en douceur."
},*/


{
  id: 24,
  name: "Tiramisu",
  description: "Dessert italien crémeux au café et mascarpone délicat.",
  price: 3.50,
  category: "Desserts",
  image: "/src/assets/images/Dessert/tiramisu.png",
  details: "Délicieux tiramisu italien, mariage parfait de café, mascarpone crémeux et biscuits trempés, pour un dessert léger et irrésistible."
},
   {
    id: 19,
    name: "Jus de bissap",
    description: "Verre de jus de bissap frais et sucré, servi bien frais",
    price: 3.90,
    category: "Boissons",
    subCategory: "jus naturels",
    image: "assets/images/Boissons/verrebissap.webp",
    details: "Infusé à base de fleurs d’hibiscus, riche en antioxydants et très rafraîchissant."
  },
  {
  id: 99,
  name: "Jus de Tamarin",
  description: "Boisson acidulée au tamarin, sucrée et désaltérante",
  price: 3.90,
  category: "Boissons",
  subCategory: "jus naturels",
  image: "/src/assets/images/Dessert/jus-tamarin.png",
  details: "Une touche exotique et énergisante venue tout droit des saveurs africaines."
},
  {
    id: 20,
    name: "Coca-Cola",
    description: "Boisson gazeuse rafraîchissante, servie bien fraîche",
    price: 0.90,
    category: "Boissons",
    subCategory: "sodas",
    image: "assets/images/Boissons/cocacola.png",
    details: "La boisson pétillante classique, toujours servie bien fraîche pour étancher la soif."
  },
  {
    id: 21,
    name: "Orangina",
    description: "Boisson pétillante à l'orange avec pulpe",
    price: 0.90,
    category: "Boissons",
    subCategory: "sodas",
    image: "assets/images/Boissons/orangina.png",
    details: "Le goût unique de l’orange avec pulpe, pour une pause pleine de pep’s."
  },
  {
    id: 22,
    name: "Schweppes Agrum'",
    description: "Boisson gazeuse au goût d’agrumes",
    price: 0.90,
    category: "Boissons",
    subCategory: "sodas",
    image: "assets/images/Boissons/schweppes.png",
    details: "Un mélange d’agrumes acidulé et tonique, avec des bulles pleines de caractère."
  },
  {
    id: 23,
    name: "Jus de Baobab",
    description: "Boisson naturelle à base de fruit du baobab, rafraîchissante et vitaminée",
    price: 3.90,
    category: "Boissons",
    subCategory: "jus naturels",
    image: "assets/images/Boissons/jus-baobab.png",
    details: "Riche en vitamines C et fibres, ce jus africain vous reconnecte à la nature."
  },
  {
    id: 24,
    name: "Thé au clou de girofle",
    description: "Infusion chaude et épicée aux clous de girofle",
    price: 1.00,
    category: "Boissons",
    subCategory: "thé et infusion",
    image: "assets/images/Boissons/the-girofle.png",
    details: "Parfait après un repas, ce thé digestif est un remède ancestral au goût intense."
  },
  {
    id: 25,
    name: "Jus de gingembre",
    description: "Boisson africaine épicée, tonifiante et servie fraîche",
    price: 3.90,
    category: "Boissons",
    subCategory: "jus naturels",
    image: "assets/images/Boissons/jus-gingembre.png",
    details: "Le célèbre ‘Gnamakoudji’ à base de gingembre frais pour booster l’énergie."
  },
  {
    id: 26,
    name: "Ice Tea Pêche",
    description: "Thé glacé à la pêche, doux et désaltérant",
    price: 3.90,
    category: "Boissons",
    subCategory: "sodas",
    image: "assets/images/Boissons/icetea-peche.png",
    details: "La douceur de la pêche combinée à la fraîcheur du thé glacé, pour une pause zen."
  },
  // Ajouts de tes boissons mentionnées
  {
    id: 27,
    name: "Castel",
    description: "Bière blonde légère et rafraîchissante, parfaite pour les moments conviviaux",
    price: 4.90,
    category: "Boissons",
    subCategory: "boissons alcoolisées",
    image: "/assets/images/Boissons/castel.png",
    details: "La bière camerounaise incontournable, à déguster bien fraîche."
  },
  {
    id: 28,
    name: "Mutzig",
    description: "Bière premium au goût équilibré, très populaire en Afrique centrale",
    price: 4.90,
    category: "Boissons",
    subCategory: "boissons alcoolisées",
    image: "/assets/images/Boissons/mutzig.webp",
    details: "Une bière légère et savoureuse pour accompagner tous vos plats."
  },
  {
    id: 29,
    name: "Guinness",
    description: "Bière stout irlandaise au goût corsé et crémeux",
    price: 3.90,
    category: "Boissons",
    subCategory: "boissons alcoolisées",
    image: "/assets/images/Boissons/guiness.webp",
    details: "Une icône mondiale, parfaite pour les amateurs de bière noire."
  },
  {
    id: 657,
    name: " Grande Guinness",
    description: "Bière stout irlandaise au goût corsé et crémeux",
    price: 5.90,
    category: "Boissons",
    subCategory: "boissons alcoolisées",
    image: "/assets/images/Boissons/guiness.webp",
    details: "Une icône mondiale, parfaite pour les amateurs de bière noire."
  },
  {
    id: 30,
    name: "Vimto",
    description: "Boisson fruitée pétillante à base de fruits rouges",
    price: 2.90,
    category: "Boissons",
    image: "/assets/images/Boissons/vimto.webp",
    subCategory: "soda afrique",
    details: "Un classique britannique apprécié pour son goût sucré et rafraîchissant."
  },
  
  {
    id: 32,
    name: "Booster",
    description: "Boisson énergisante pour garder la pêche toute la journée",
    price: 4.90,
    category: "Boissons",
    image: "/assets/images/Boissons/booster.jpeg",
    subCategory: "boissons alcoolisées",
    details: "Une formule tonique pour une énergie rapide."
  },
  {
    id: 33,
    name: "Kadji Bière",
    description: "Bière artisanale locale au goût authentique",
    price: 4.90,
    category: "Boissons",
    image: "/assets/images/Boissons/kadji.png",
    subCategory: "boissons alcoolisées",
    details: "Un savoir-faire brassicole pour une dégustation unique."
  },
  {
    id: 34,
    name: "33 Export",
    description: "Bière blonde très appréciée en Afrique, rafraîchissante et légère",
    price: 4.90,
    category: "Boissons",
    image: "/assets/images/Boissons/33export.png",
    subCategory: "boissons alcoolisées",
    details: "Un classique des bières africaines, parfaite pour vos moments festifs."
  },
  {
    id: 35,
    name: "Cola Champion",
    description: "Boisson gazeuse sucrée et rafraîchissante",
    price: 0.90,
    category: "Boissons",
    subCategory: "sodas",
    image: "/assets/images/Boissons/colachampion.png",
    details: "Un cola au goût authentique, très populaire localement."
  },
  {
    id: 36,
    name: "Eau de coco",
    description: "Boisson naturelle et désaltérante, directement issue de la noix de coco",
    price: 1.50,
    category: "Boissons",
    subCategory: "jus naturels",
    image: "/assets/images/Boissons/eau-coco.png",
    details: "Parfait pour rester hydraté avec une touche exotique."
  },
 
  {
    id: 38,
    name: "Isembeck",
    description: "Bière locale artisanale au goût unique",
    price: 5.50,
    category: "Boissons",
    subCategory: "boissons alcoolisées",
    image: "/assets/images/Boissons/isembeck.png",
    details: "Brassée avec passion pour les amateurs de bière authentique."
  },
  {
    id: 39,
    name: "Malta Guinness",
    description: "Boisson maltée non alcoolisée à base de Guinness",
    price: 1.90,
    category: "Boissons",
    subCategory: "soda afrique",
    image: "/assets/images/Boissons/maltaguinness.png",
    details: "Le goût Guinness en version douce et rafraîchissante."
  },
  {
  id: 400,
  name: "Top Pamplemousse",
  description: "Soda pétillant au goût intense de pamplemousse",
  price: 2.90,
  category: "Boissons",
  subCategory: "soda afrique",
  image: "/assets/images/Boissons/toppamplemousse.png",
  details: "Rafraîchissant et légèrement amer, un classique camerounais très apprécié en été."
},
{
  id: 401,
  name: "Top Ananas",
  description: "Soda doux et fruité à l’ananas",
  price: 2.90,
  category: "Boissons",
  subCategory: "soda afrique",
  image: "/assets/images/Boissons/topananas.png",
  details: "Son goût sucré et sa bulle légère en font la boisson parfaite pour accompagner un repas africain."
},
{
  id: 402,
  name: "Top Grenadine",
  description: "Boisson gazeuse au goût sucré de grenadine",
  price: 2.90,
  category: "Boissons",
  subCategory: "soda afrique",
  image: "/assets/images/Boissons/topgrenadine.png",
  details: "Un soda vif et fruité qui plait à tous les âges, idéal bien frais."
},
{
  id: 403,
  name: "Top Orange",
  description: "Soda pétillant au goût d’orange douce",
  price: 1.20,
  category: "Boissons",
  subCategory: "soda afrique",
  image: "/assets/images/Boissons/toporange.png",
  details: "Un grand classique des sodas africains, au goût sucré et acidulé bien équilibré."
},
{
  id: 404,
  name: "D’jino Cocktail",
  description: "Soda africain fruité au goût unique de cocktail tropical",
  price: 1.50,
  category: "Boissons",
  subCategory: "soda afrique",
  image: "/assets/images/Boissons/djinococktail.png",
  details: "Un soda sucré et coloré, star des fêtes camerounaises et ivoiriennes."
},

{
  id: 407,
  name: "Fanta ",
  description: "Boisson gazeuse au citron, version Afrique",
  price: 1.90,
  category: "Boissons",
  subCategory: "soda afrique",
  image: "/assets/images/Boissons/fanta2.png",
  details: "Plus acidulé que son cousin européen, le Fanta africain désaltère à fond."
},
{
  id: 408,
  name: "Youzou",
  description: "Soda camerounais aromatisé, au goût fruité et unique",
  price: 1.50,
  category: "Boissons",
  subCategory: "soda afrique",
  image: "/assets/images/Boissons/youzou.png",
  details: "Une boisson qui allie originalité et rafraîchissement, très populaire au Cameroun."
},


   {
  id: 390,
  name: "Café noir",
  description: "Tasse de café noir corsé, servi chaud pour un coup de boost",
  price: 1.00,
  category: "Boissons",
  subCategory: "Café",
  image: "/assets/images/Boissons/cafe.png",
  details: "Infusé à partir de grains soigneusement sélectionnés, ce café offre une saveur intense et revigorante."
},

   {
    id: 93,
    name: "Guinness Irlande",
    description: "Boisson maltée non alcoolisée à base de Guinness",
    price: 2.90,
    category: "Boissons",
    subCategory: "boissons alcoolisées",
    image: "/assets/images/Boissons/guinnessirlande.png",
    details: "Le goût Guinness en version douce et rafraîchissante."
  },
 
  {
    id: 41,
    name: "Fanta",
    description: "Boisson gazeuse fruitée à l’orange",
    price: 0.90,
    category: "Boissons",
    subCategory: "sodas",
    image: "/assets/images/Boissons/fanta.png",
    details: "Un classique pétillant et fruité pour rafraîchir vos journées."
  },
  {
  id: 4232,
  name: "7UP",
  description: "Boisson gazeuse citron-lime, légère et désaltérante",
  price: 0.90,
  category: "Boissons",
  subCategory: "sodas",
  image: "/assets/images/Boissons/7up.png",
  details: "Parfaite pour se rafraîchir sans caféine, goût citron-lime."
},
{
  id: 4013,
  name: "Oasis Tropical",
  description: "Boisson aux fruits exotiques sans bulles",
  price: 0.90,
  category: "Boissons",
  subCategory: "sodas",
  image: "/assets/images/Boissons/oasis-tropical.png",
  details: "Un mélange fruité tropical sans gaz, pour les amateurs de douceur."
},
{
  id: 4094,
  name: "Fanta Cassis",
  description: "Boisson gazeuse au cassis au goût intense et sucré",
  price: 0.90,
  category: "Boissons",
  subCategory: "sodas",
  image: "/assets/images/Boissons/fanta-cassis.png",
  details: "Une explosion de cassis dans une boisson gazeuse rafraîchissante."
},
{
  id: 4655,
  name: "Tropico",
  description: "Boisson fruitée sans bulles au goût tropical",
  price: 0.90,
  category: "Boissons",
  subCategory: "sodas",
  image: "/assets/images/Boissons/tropico.png",
  details: "Un goût exotique emblématique, parfait pour une pause fruitée."
},
  {
    id: 42,
    name: "Jus de mangue",
    description: "Jus naturel de mangue, sucré et onctueux",
    price: 2.00,
    category: "Boissons",
    subCategory: "jus naturels",
    image: "/assets/images/Boissons/jus-mangue.png",
    details: "Un goût exotique et sucré, parfait pour se rafraîchir."
  },
  {
    id: 43,
    name: "Jus de goyave",
    description: "Jus naturel de goyave, riche en saveurs",
    price: 2.00,
    category: "Boissons",
    subCategory: "jus naturels",
    image: "/assets/images/Boissons/jus-goyave.png",
    details: "Un fruit tropical délicieux et vitaminé."
  },
 
  {
  id: 44,
  name: "Thé bissap",
  description: "Verre de jus de bissap frais et sucré, servi bien frais",
  price: 1.00,
  category: "Boissons",
  subCategory: "thé et infusion",
  image: "/assets/images/Boissons/verrebissap.png",
  details: "Infusé à base de fleurs d’hibiscus, riche en antioxydants et très rafraîchissant."
},
{
  id: 97,
  name: "Thé Lipton",
  description: "Thé noir classique servi chaud, délicatement infusé",
  price: 1.00,
  category: "Boissons",
  subCategory: "thé et infusion",
  image: "/assets/images/Boissons/thelipton.png",
  details: "Thé noir Lipton infusé à la perfection, idéal pour une pause réconfortante et pleine de saveurs."
},
{
  id: 98,
  name: "Thé Kinkéliba",
  description: "Infusion traditionnelle aux feuilles de kinkéliba, servie chaude",
  price: 1.00,
  category: "Boissons",
  subCategory: "thé et infusion",
  image: "/assets/images/Boissons/thekinkeliba.png",
  details: "Connu pour ses bienfaits digestifs et détox, le kinkéliba est une boisson naturelle et apaisante du Sahel."
},


{
  id: 45,
  name: "Thé gingembre",
  description: "Boisson africaine épicée, tonifiante et servie fraîche",
  price: 1.00,
  category: "Boissons",
  subCategory: "thé et infusion",
  image: "/assets/images/Boissons/the-gingembre.png",
  details: "Le célèbre ‘Gnamakoudji’ à base de gingembre frais pour booster l’énergie."
},
{
  id: 46,
  name: "Thé moringa",
  description: "Boisson naturelle aux bienfaits du moringa, légère et revitalisante",
  price: 1.00,
  category: "Boissons",
  subCategory: "thé et infusion",
  image: "/assets/images/Boissons/jus-moringa.png",
  details: "Riche en vitamines et antioxydants, idéale pour une pause santé."
},
{
  id: 47,
  name: "Thé Citronnelle",
  description: "Infusion fraîche et parfumée de citronnelle, pour une sensation apaisante",
  price: 1.00,
  category: "Boissons",
  subCategory: "thé et infusion",
  image: "/assets/images/Boissons/jus-citronnelle.png",
  details: "Saveur citronnée douce, parfaite pour se désaltérer en douceur."
},
{
  id: 48,
  name: "Thé Menthe",
  description: "Boisson rafraîchissante à la menthe, idéale pour les journées chaudes",
  price: 1.00,
  category: "Boissons",
  subCategory: "thé et infusion",
  image: "/assets/images/Boissons/jus-menthe.png",
  details: "Saveur mentholée légère qui désaltère et rafraîchit instantanément."
},
  

  {
  id: 27,
  name: "Ndolé - Frites de plantain",
  description: "Feuilles d’amarante mijotées servies avec des frites de plantain croustillantes.",
  price: 25.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/ndole-frites-plantain.png",
  details: "Un plat classique alliant douceur et caractère pour un weekend aux saveurs du pays."
},
{
  id: 28,
  name: "Beignets maïs ou farine Haricots Bouillie",
  description: "Trio populaire camerounais : beignets dorés, haricots fondants, bouillie onctueuse.",
  price: 10.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/beignets-haricots-bouillie.png",
  details: "Un petit-déjeuner de roi ou un brunch du weekend typique et réconfortant."
},
{
  id: 29,
  name: "Eru - Waterfufu",
  description: "Feuilles d’éru mijotées accompagnées de waterfufu tendre.",
  price: 25.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/eru-water-fufu.png",
  details: "Une spécialité du Sud-Ouest Cameroun riche en goût et en tradition."
},
{
  id: 30,
  name: "Sauce Gombo - Fufu Manioc",
  description: "Sauce gombo glissante et parfumée servie avec du fufu de manioc.",
  price: 15.90,
  category: "Spécial Weekend",
  image: "/images/special-weekend/sauce-gombo-fufu-manioc.png",
  details: "Un plat généreux et typique aux textures uniques, très apprécié au pays."
},
{
  id: 31,
  name: "Banane malaxée - Mouton ou chèvre",
  description: "Purée de banane salée servie avec une viande de mouton ou de chèvre en sauce.",
  price: 15.90,
  category: "Spécial Weekend",
  image: "/images/special-weekend/banane-malaxee-mouton.png",
  details: "Un plat ancré dans la tradition, savoureux et consistant pour bien terminer la semaine."
},
{
  id: 32,
  name: "Bouillon de pieds de bœuf - Manioc ou plantain",
  description: "Bouillon parfumé de pieds de bœuf servi avec manioc ou plantain cuit vapeur.",
  price: 15.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/toto.png",
  details: "Un plat riche en collagène et en arômes pour les amateurs de cuisine authentique."
},
{
  id: 33,
  name: "Taro - Sauce Jaune",
  description: "Taro pilé accompagné d’une sauce jaune bien relevée.",
  price: 25.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/taro-sauce-jaune.png",
  details: "Un incontournable du terroir camerounais, parfait pour les grandes occasions."
},
{
  id: 34,
  name: "Mbongo Tchobi-Plantain Mur ou cuit a la vapeur ",
  description: "Poisson mijoté dans une sauce noire aux épices brûlées.",
  price: 15.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/mbongo-tchobi.png",
  details: "Plat emblématique de la région Bassa, intense et envoûtant."
},

{
  id: 36,
  name: "Okok Eton - Manioc vapeur ou bâton",
  description: "Okok (feuilles d’essong) accompagné de manioc vapeur ou bâton traditionnel.",
  price: 15.00,
  category: "Spécial Weekend",
  image: "/images/special-weekend/okok-manioc.png",
  details: "Plat traditionnel des Eton, riche en goût et en souvenirs familiaux."
},
{
  id: 37,
  name: "Koki - Banane",
  description: "Koki à base de niébé, servi avec de la banane cuite à la vapeur.",
  price: 15.90,
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
