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

  // 🔥 Ajouts pour personnalisation utilisateur
  selectedComplement?: string;  // Accompagnement choisi
  selectedSauce?: string;       // Sauce choisie

  category:
    | "Boissons"
    | "Entrées"
    | "Plats"
    | "Desserts"
    | "Spécial Weekend"
    | "Concept du Chef";

  subCategory?: string;         // Par ex. "boissons alcoolisées"
  image: string;
  details: string;

  complements?: string[];       // Liste des accompagnements proposés
  sauces?: string[];            // Liste des sauces proposées
};
