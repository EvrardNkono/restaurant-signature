export interface Dish {
  id: number;
  name: string;
  description: string;
  price: string;
  category: "Entrées" | "Plats" | "Desserts" | "Boissons";
  image: string;
  details?: string; // ✅ ← Ajout du champ details
}
