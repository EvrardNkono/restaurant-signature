import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Dish } from '../data/types';

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
  lastRemovedProduct: Dish | null; // ✅ Ajouté ici
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastRemovedProduct, setLastRemovedProduct] = useState<Dish | null>(null); // ✅

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
      let removed = false;
      const updatedItems = prevItems.flatMap(i => {
        if (
          i.dish.id === dish.id &&
          i.selectedComplement === dish.selectedComplement &&
          i.selectedSauce === dish.selectedSauce &&
          i.isTakeaway === dish.isTakeaway
        ) {
          if (i.quantity > 1) {
            removed = true;
            return [{ ...i, quantity: i.quantity - 1 }];
          } else {
            removed = true;
            return [];
          }
        }
        return [i];
      });

      if (removed) {
        setLastRemovedProduct(dish);
      }

      return updatedItems;
    });
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  // 🧼 Reset automatique après animation
  useEffect(() => {
    if (lastRemovedProduct) {
      const timeout = setTimeout(() => {
        setLastRemovedProduct(null);
      }, 700); // même durée que l’animation
      return () => clearTimeout(timeout);
    }
  }, [lastRemovedProduct]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        lastRemovedProduct // ✅ Ajouté ici
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit être utilisé dans CartProvider');
  return context;
};
