export type Dish = {
  id: number;
  name: string;
  description: string;
  price: number;
  takeawayPrice?: number; // prix à emporter facultatif
  isTakeaway?: boolean;   // flag prise en compte optionnelle
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
