export type PromoPack = {
  quantity: number; // Nombre de bières dans le pack
  price: number;    // Prix total du pack
};

export type Dish = {
  id: number;
  name: string;
  description: string;
  price: number;
  takeawayPrice?: number;     // Prix à emporter facultatif
  isTakeaway?: boolean;       // Indique si le plat est à emporter
  promoPack?: PromoPack;      // Formule promotionnelle si disponible
  category:
    | "Boissons"
    | "Entrées"
    | "Plats"
    | "Desserts"
    | "Spécial Weekend"
    | "Concept du Chef";
  subCategory?: string;
  image: string;
  details: string;
  complements?: string[];
  sauces?: string[];
};
