import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dish } from '../data/types';

interface CartItem {
  dish: Dish;
  quantity: number;
  selectedComplement?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (dish: Dish & { selectedComplement?: string }) => void;
  removeFromCart: (dish: Dish & { selectedComplement?: string }) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (dish: Dish & { selectedComplement?: string }) => {
    setItems(prevItems => {
      const itemExists = prevItems.find(i =>
        i.dish.id === dish.id &&
        i.selectedComplement === dish.selectedComplement
      );

      if (itemExists) {
        // Incrémente la quantité si plat + accompagnement déjà présent
        return prevItems.map(i =>
          i.dish.id === dish.id && i.selectedComplement === dish.selectedComplement
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      // Ajoute une nouvelle ligne (plat ou accompagnement différent)
      return [...prevItems, { dish, quantity: 1, selectedComplement: dish.selectedComplement }];
    });
  };

  const removeFromCart = (dish: Dish & { selectedComplement?: string }) => {
    setItems(prevItems =>
      prevItems.filter(i =>
        !(i.dish.id === dish.id && i.selectedComplement === dish.selectedComplement)
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit être utilisé dans CartProvider');
  return context;
};
