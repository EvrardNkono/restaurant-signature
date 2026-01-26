import { createContext, useContext, useState, type ReactNode } from "react";

// Mise à jour de l'interface pour accepter les IDs de MongoDB (string)
interface CartItem {
  id: string; 
  name: string;
  price: string | number; // Souple pour accepter "15" ou 15
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Ajoute le plat au panier
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Sécurité pour éviter les doublons
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  // Retire le plat via son ID MongoDB (string)
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter(i => i.id !== id));
  };

  // Vérifie la présence via son ID MongoDB (string)
  const isInCart = (id: string) => cart.some(item => item.id === id);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};