import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dish } from '../data/types';

// ✅ Type enrichi pour Dish avec les propriétés supplémentaires
type DishWithExtras = Dish & {
  selectedComplement?: string;
  selectedSauce?: string;
  isTakeaway?: boolean;
};

interface CartItem {
  dish: Dish;
  quantity: number;
  selectedComplement?: string;
  selectedSauce?: string;
  isTakeaway?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (dish: DishWithExtras) => void;
  removeFromCart: (dish: DishWithExtras) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (dish: DishWithExtras) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i =>
        i.dish.id === dish.id &&
        i.selectedComplement === dish.selectedComplement &&
        i.selectedSauce === dish.selectedSauce &&
        i.isTakeaway === dish.isTakeaway
      );

      if (existingItem) {
        return prevItems.map(i =>
          i.dish.id === dish.id &&
          i.selectedComplement === dish.selectedComplement &&
          i.selectedSauce === dish.selectedSauce &&
          i.isTakeaway === dish.isTakeaway
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prevItems,
        {
          dish,
          quantity: 1,
          selectedComplement: dish.selectedComplement,
          selectedSauce: dish.selectedSauce,
          isTakeaway: dish.isTakeaway
        }
      ];
    });
  };

  const removeFromCart = (dish: DishWithExtras) => {
    setItems(prevItems => {
      return prevItems.flatMap(i => {
        if (
          i.dish.id === dish.id &&
          i.selectedComplement === dish.selectedComplement &&
          i.selectedSauce === dish.selectedSauce &&
          i.isTakeaway === dish.isTakeaway
        ) {
          if (i.quantity > 1) {
            return [{ ...i, quantity: i.quantity - 1 }];
          } else {
            return [];
          }
        }
        return [i];
      });
    });
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
