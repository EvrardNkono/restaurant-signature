export type Dish = {
  id: number;
  name: string;
  description: string;
  price: number;
  category:
    | "Boissons"
    | "Entrées"
    | "Plats"
    | "Desserts"
    | "Spécial Weekend"
    | "Concept du Chef"; // ✅ nouvelle catégorie ajoutée
  image: string;
  details: string;
  complements?: string[]; // 👈 accompagnements optionnels
};
