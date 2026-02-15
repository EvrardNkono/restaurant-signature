import { createContext, useContext, useState, type ReactNode } from "react";

// Interface mise à jour
interface CartItem {
  id: string; 
  name: string;
  price: string | number; 
  image?: string;
  chosenAccompaniment?: string; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  isInCart: (id: string) => boolean;
  clearCart: () => void; // --- AJOUTÉ : Pour vider le panier après commande ---
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Ajoute le plat au panier
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // On vérifie si l'article existe DÉJÀ avec le MÊME accompagnement
      const isDuplicate = prev.some(
        (i) => i.id === item.id && i.chosenAccompaniment === item.chosenAccompaniment
      );
      
      if (isDuplicate) return prev;
      return [...prev, item];
    });
  };

  // Retire le plat
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Vérifie la présence
  const isInCart = (id: string) => cart.some((item) => item.id === id);

  // --- NOUVELLE FONCTION : Vider le panier ---
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};