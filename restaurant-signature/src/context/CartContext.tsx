import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dish } from '../data/types';

interface CartItem {
  dish: Dish;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (dish: Dish) => void;
  removeFromCart: (dishId: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (dish: Dish) => {
    setItems(prevItems => {
      const itemExists = prevItems.find(i => i.dish.id === dish.id);
      if (itemExists) {
        // incrémente quantité
        return prevItems.map(i =>
          i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // ajoute plat neuf
      return [...prevItems, { dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: number) => {
    setItems(prevItems => prevItems.filter(i => i.dish.id !== dishId));
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
