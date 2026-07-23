// src/data/blogData.ts
export interface BlogAuthor {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: BlogAuthor;
  categories: BlogCategory[];
  tags: string[];
  publishedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  comments: number;
  isFeatured: boolean;
  isTrending: boolean;
  status: "published" | "draft" | "archived";
}

export const MOCK_POSTS: BlogPost[] = [
  {
    _id: "1",
    title: "Le Poulet Yassa revisité : Quand l'Afrique rencontre la France",
    slug: "poulet-yassa-revisite",
    excerpt: "Notre chef revisite le célèbre poulet Yassa sénégalais en y apportant une touche française. Un mariage parfait entre l'Afrique de l'Ouest et la gastronomie française.",
    content: `Le Poulet Yassa est l'un des plats emblématiques de l'Afrique de l'Ouest, particulièrement au Sénégal. Dans notre version Signature, nous avons osé le mariage entre les saveurs africaines et la technique française.

## Les origines du Yassa

Le Yassa est né dans la région de la Casamance au Sénégal. Traditionnellement, il s'agit d'un poulet mariné dans une sauce aux oignons, citron et moutarde, puis grillé et mijoté.

## Notre revisite Signature

Notre chef Jean-Pierre a imaginé une version hybride qui respecte l'âme du plat tout en y apportant une élégance française :

- **Marinade** : citron vert, oignons, moutarde à l'ancienne, ail, gingembre et piment Scotch Bonnet
- **Cuisson** : saisie à la poêle façon française, puis mijotage lent
- **Accompagnement** : riz basmati parfumé à la cardamone, avec une touche de beurre clarifié

> "Le Yassa est le plat qui raconte l'histoire de la rencontre entre les épices africaines et la technique culinaire française."

## L'accord mets-vins

Pour accompagner ce plat, notre sommelier Marie recommande un **Chablis** ou un **Sancerre** pour contraster avec l'acidité du citron.`,
    featuredImage: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&h=600&fit=crop",
    author: {
      _id: "auth1",
      name: "Chef Jean-Pierre",
      avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&h=150&fit=crop&crop=face",
      bio: "Chef passionné par la fusion culinaire Afrique-Caraïbes-Europe"
    },
    categories: [
      { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
      { _id: "cat3", name: "Recettes", slug: "recettes", color: "#2ECC71" }
    ],
    tags: ["yassa", "sénégal", "fusion", "afrique", "gastronomie"],
    publishedAt: "2024-12-15T10:00:00Z",
    readingTime: 6,
    views: 2341,
    likes: 167,
    comments: 34,
    isFeatured: true,
    isTrending: true,
    status: "published"
  },
  {
    _id: "2",
    title: "Accras de Morue et Champagne : L'Apéritif Créole-Français",
    slug: "accras-morue-champagne",
    excerpt: "Découvrez notre version raffinée des accras de morue antillais, servis avec un champagne frais. L'apéritif parfait entre les Caraïbes et la France.",
    content: `Les accras de morue sont l'incontournable des apéritifs antillais. Nous avons revisité cette spécialité caribéenne pour en faire un mets d'exception qui s'accorde à merveille avec un champagne brut.

## L'histoire des Accras

Venus des Antilles, les accras sont des beignets salés à base de morue, d'herbes et d'épices. Ils sont le symbole de la convivialité créole.

## Notre interprétation Signature

- **Morue** : dessalée 24h, effilochée
- **Pâte** : farine de pois chiches, lait de coco, citron vert
- **Épices** : piment antillais, ciboulette, persil, ail
- **Cuisson** : friture légère dans l'huile d'arachide
- **Service** : avec une sauce tiède au piment et un zeste de citron vert

> "L'accra est le pont entre deux mondes : la chaleur des Caraïbes et l'élégance française."

## L'accord parfait

Notre sommelier vous propose un **Champagne Brut** ou un **Crémant** pour une expérience gustative exceptionnelle.`,
    featuredImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    author: {
      _id: "auth2",
      name: "Sommelière Marie",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      bio: "Sommelière passionnée par les accords entre vins français et cuisines du monde"
    },
    categories: [
      { _id: "cat2", name: "Apéritifs", slug: "aperitifs", color: "#8B0000" },
      { _id: "cat4", name: "Caraïbes", slug: "caraibes", color: "#3498DB" }
    ],
    tags: ["accras", "caraïbes", "apéritif", "champagne", "crêole"],
    publishedAt: "2024-12-12T14:30:00Z",
    readingTime: 5,
    views: 1456,
    likes: 89,
    comments: 23,
    isFeatured: false,
    isTrending: true,
    status: "published"
  },
  {
    _id: "3",
    title: "Le Mafé-Fondant au Chocolat : Voyage entre Dakar et Paris",
    slug: "mafe-fondant-chocolat",
    excerpt: "Notre chef fusionne le mafé sénégalais avec le fondant au chocolat français. Une création audacieuse qui marie l'arachide africaine au chocolat français.",
    content: `Le Mafé est le plat national du Sénégal, une sauce onctueuse à base de pâte d'arachide. Notre chef a eu l'idée audacieuse de revisiter ce grand classique sous forme de dessert.

## La rencontre des mondes

- **Mafé** : sauce à l'arachide, tomate, oignon, piment
- **Fondant au chocolat** : chocolat noir Grand Cru, beurre, œufs
- **Le mariage** : une ganache au chocolat infusée à la pâte d'arachide

> "Quand l'arachide africaine rencontre le chocolat français, naît une alchimie gustative unique."

## La création Signature

Notre chef a imaginé un dessert qui rend hommage aux deux cultures :

- **Base** : fondant au chocolat noir intense
- **Cœur** : coulant à la pâte d'arachide caramélisée
- **Topping** : chips de plantain croustillant
- **Sauce** : caramel au piment antillais

## L'accord mets-vins

Un **Rivesaltes** ou un **Ratafia** accompagnera parfaitement ce dessert d'exception.`,
    featuredImage: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop",
    author: {
      _id: "auth1",
      name: "Chef Jean-Pierre",
      avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&h=150&fit=crop&crop=face",
      bio: "Chef passionné par la fusion culinaire Afrique-Caraïbes-Europe"
    },
    categories: [
      { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
      { _id: "cat5", name: "Desserts", slug: "desserts", color: "#9B59B6" }
    ],
    tags: ["mafé", "sénégal", "fondant", "chocolat", "fusion", "dessert"],
    publishedAt: "2024-12-08T09:00:00Z",
    readingTime: 7,
    views: 2150,
    likes: 178,
    comments: 42,
    isFeatured: true,
    isTrending: false,
    status: "published"
  },
  {
    _id: "4",
    title: "Le Colombo Créole à la Française",
    slug: "colombo-creole-francaise",
    excerpt: "Notre version du colombo antillais, sublimé par les techniques de la cuisine française. Un voyage gourmand entre les Caraïbes et la France.",
    content: `Le Colombo est un ragoût emblématique des Antilles, parfumé au colombo (mélange d'épices). Nous avons revisité ce classique pour lui apporter une élégance française.

## Les origines du Colombo

Ce plat est originaire de la Martinique et de la Guadeloupe. Il tire son nom du colombo, un mélange d'épices inspiré du curry indien.

## Notre version Signature

- **Viande** : poulet fermier ou cabri (selon saison)
- **Épices** : colombo maison (coriandre, cumin, fenugrec, curcuma)
- **Légumes** : patate douce, carotte, oignon, poivron
- **Cuisson** : mijotage lent à la cocotte en fonte
- **Touche française** : déglacage au vin blanc, beurre noisette

> "Le colombo est l'âme des Caraïbes, sublimé par la technique française."

## L'accord mets-vins

Un **Côte-du-Rhône** ou un **Beaujolais** accompagnera idéalement ce plat.`,
    featuredImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop",
    author: {
      _id: "auth1",
      name: "Chef Jean-Pierre",
      avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&h=150&fit=crop&crop=face",
      bio: "Chef passionné par la fusion culinaire Afrique-Caraïbes-Europe"
    },
    categories: [
      { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
      { _id: "cat4", name: "Caraïbes", slug: "caraibes", color: "#3498DB" }
    ],
    tags: ["colombo", "antilles", "caraïbes", "fusion", "gastronomie"],
    publishedAt: "2024-12-05T16:00:00Z",
    readingTime: 6,
    views: 1880,
    likes: 134,
    comments: 28,
    isFeatured: false,
    isTrending: false,
    status: "published"
  },
  {
    _id: "5",
    title: "L'Alloco Parisien : Plantains et Sauce Bourguignonne",
    slug: "alloco-parisien",
    excerpt: "Un mariage audacieux entre l'allocoté ivoirien et la sauce bourguignonne française. La rencontre de l'Afrique et de la France dans une assiette.",
    content: `L'allocoté (ou alloco) est un plat de plantains frits très populaire en Côte d'Ivoire et dans toute l'Afrique de l'Ouest. Notre chef a eu l'idée de le marier avec une sauce bourguignonne.

## L'allocoté traditionnel

C'est un plat de rue emblématique d'Abidjan. Les plantains sont frits et servis avec une sauce tomate ou une sauce pimentée.

## Notre création Signature

- **Plantains** : sélectionnés à maturité parfaite
- **Cuisson** : friture à l'huile de palme
- **Sauce bourguignonne** : vin rouge, oignons, thym, lardons
- **Service** : dressé comme un plat gastronomique

> "L'allocoté, c'est l'âme de la cuisine africaine rencontrant l'élégance de la sauce bourguignonne."

## L'accord mets-vins

Un **Bourgogne Pinot Noir** sublimateur parfait pour ce plat.`,
    featuredImage: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&h=600&fit=crop",
    author: {
      _id: "auth3",
      name: "Équipe Signature",
      avatar: "https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=150&h=150&fit=crop&crop=face",
      bio: "L'équipe du restaurant Signature, passionnée de fusion culinaire"
    },
    categories: [
      { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
      { _id: "cat6", name: "Afrique", slug: "afrique", color: "#E67E22" }
    ],
    tags: ["allocoté", "côte d'ivoire", "afrique", "bourgogne", "fusion"],
    publishedAt: "2024-12-01T11:00:00Z",
    readingTime: 5,
    views: 980,
    likes: 67,
    comments: 19,
    isFeatured: false,
    isTrending: false,
    status: "published"
  },
  {
    _id: "6",
    title: "Le Poulet DG revisité : Du Cameroun à la France",
    slug: "poulet-dg-revisite",
    excerpt: "Notre chef revisite le célèbre Poulet DG camerounais en y apportant une touche française et occidentale. Un plat festif qui traverse les continents.",
    content: `Le Poulet DG (Directeur Général) est un plat de fête camerounais. Riche et généreux, il est généralement réservé aux grandes occasions. Nous avons revisité ce classique pour lui apporter une nouvelle dimension.

## Le Poulet DG traditionnel

Ce plat emblématique du Cameroun est un ragoût de poulet aux plantains et légumes, parfumé aux épices.

## Notre version Signature

- **Poulet** : fermier, mariné dans un mélange d'épices camerounaises
- **Légumes** : plantains mûrs, carottes, oignons
- **Sauce** : tomate, poivron, ail, gingembre
- **Touche française** : sauce béarnaise légère, persillade
- **Accompagnement** : riz pilaf aux épices

> "Le Poulet DG est le symbole de la générosité camerounaise, sublimé par la précision française."

## L'accord mets-vins

Un **Coteaux-du-Languedoc** ou un **Minervois** pour accompagner ce plat festif.`,
    featuredImage: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop",
    author: {
      _id: "auth1",
      name: "Chef Jean-Pierre",
      avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&h=150&fit=crop&crop=face",
      bio: "Chef passionné par la fusion culinaire Afrique-Caraïbes-Europe"
    },
    categories: [
      { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
      { _id: "cat6", name: "Afrique", slug: "afrique", color: "#E67E22" }
    ],
    tags: ["poulet DG", "cameroun", "afrique", "fusion", "fête"],
    publishedAt: "2024-11-25T10:00:00Z",
    readingTime: 6,
    views: 1560,
    likes: 112,
    comments: 31,
    isFeatured: false,
    isTrending: true,
    status: "published"
  },
  {
    _id: "7",
    title: "Tartare de Bœuf aux Épices Antillaises",
    slug: "tartare-boeuf-epices-antillaises",
    excerpt: "Le tartare de bœuf classique revisité avec les épices des Caraïbes. Une explosion de saveurs entre tradition française et exotisme antillais.",
    content: `Le tartare de bœuf est un grand classique de la cuisine française. Notre chef l'a réinventé en y ajoutant les épices des Caraïbes pour une expérience gustative unique.

## Le mariage des mondes

- **Bœuf** : coupé au couteau, qualité Charolais
- **Épices antillaises** : piment antillais, citron vert, coriandre
- **Assaisonnement** : sauce créole légère, huile d'olive parfumée
- **Accompagnement** : chips de plantain, salade verte

> "Le tartare est la base de la cuisine française, rehaussée par la chaleur des Caraïbes."

## Le service

Notre chef vous propose ce tartare avec un choix de condiments :

- Sauce créole
- Pickles de légumes
- Piments antillais

## L'accord mets-vins

Un **Rosé de Provence** ou un **Côtes-de-Provence** accompagnera parfaitement ce tartare.`,
    featuredImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
    author: {
      _id: "auth2",
      name: "Sommelière Marie",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      bio: "Sommelière passionnée par les accords entre vins français et cuisines du monde"
    },
    categories: [
      { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
      { _id: "cat4", name: "Caraïbes", slug: "caraibes", color: "#3498DB" }
    ],
    tags: ["tartare", "bœuf", "antilles", "fusion", "caraïbes"],
    publishedAt: "2024-11-20T14:00:00Z",
    readingTime: 4,
    views: 890,
    likes: 56,
    comments: 15,
    isFeatured: false,
    isTrending: false,
    status: "published"
  },
  {
    _id: "8",
    title: "La Soupe d'igname et Foie Gras : Le Métissage Parfait",
    slug: "soupe-igname-foie-gras",
    excerpt: "Notre chef fusionne la soupe d'igname traditionnelle d'Afrique de l'Ouest avec le foie gras français. Un mariage audacieux entre luxe et tradition.",
    content: `La soupe d'igname est un classique réconfortant d'Afrique de l'Ouest. Notre chef a eu l'idée audacieuse de la marier avec le foie gras français pour créer une entrée d'exception.

## Les origines

La soupe d'igname est préparée dans de nombreux pays d'Afrique de l'Ouest. C'est un plat réconfortant, riche et savoureux.

## Notre création Signature

- **Ignames** : sélectionnées pour leur onctuosité
- **Foie gras** : mi-cuit, poêlé
- **Bouillon** : volaille, épices ouest-africaines
- **Finish** : huile de piment, fleur de sel

> "La soupe d'igname est le réconfort des cuisines africaines, magnifiée par le foie gras français."

## L'accord mets-vins

Un **Sauternes** ou un **Monbazillac** accompagnent à merveille ce mariage.`,
    featuredImage: "https://images.unsplash.com/photo-1585515320310-2591f5bc05b3?w=800&h=600&fit=crop",
    author: {
      _id: "auth1",
      name: "Chef Jean-Pierre",
      avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&h=150&fit=crop&crop=face",
      bio: "Chef passionné par la fusion culinaire Afrique-Caraïbes-Europe"
    },
    categories: [
      { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
      { _id: "cat6", name: "Afrique", slug: "afrique", color: "#E67E22" }
    ],
    tags: ["igname", "foie gras", "afrique", "fusion", "luxe"],
    publishedAt: "2024-11-15T09:00:00Z",
    readingTime: 5,
    views: 760,
    likes: 45,
    comments: 11,
    isFeatured: false,
    isTrending: false,
    status: "published"
  }
];

export const MOCK_CATEGORIES: BlogCategory[] = [
  { _id: "cat1", name: "Cuisine Fusion", slug: "cuisine-fusion", color: "#D4AF37" },
  { _id: "cat2", name: "Apéritifs", slug: "aperitifs", color: "#8B0000" },
  { _id: "cat3", name: "Recettes", slug: "recettes", color: "#2ECC71" },
  { _id: "cat4", name: "Caraïbes", slug: "caraibes", color: "#3498DB" },
  { _id: "cat5", name: "Desserts", slug: "desserts", color: "#9B59B6" },
  { _id: "cat6", name: "Afrique", slug: "afrique", color: "#E67E22" }
];