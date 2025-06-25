export type Dish = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "Boissons" | "Entrées" | "Plats" | "Desserts" | "Spécial Weekend";
  image: string;
  details: string;
};
