export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "Entrées" | "Plats" | "Desserts" | "Boissons";
  image: string;
  details?: string; // ✅ ← Ajout du champ details
}
