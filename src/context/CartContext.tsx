import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// --- INTERFACES ---
export interface CartSupplement {
  id: string; 
  name: string;
  price: number;
  status: "pending" | "sent"; 
}

export interface CartItem {
  cartItemId: string;    
  id: string;            
  name: string;
  price: number; 
  quantity: number; 
  category?: string;
  image?: string;
  chosenAccompaniment?: string;
  supplements: CartSupplement[];
  status: "pending" | "paid" | "delivered"; 
  type: "JOUR" | "SOIR";
  offer?: {
    enabled: boolean;
    requiredQuantity: number;
    offerPrice: number;
  };
}

interface CartContextType {
  cart: CartItem[];
  activeMenuType: "JOUR" | "SOIR" | null;
  addToCart: (item: Omit<CartItem, "cartItemId" | "status" | "quantity">, menuType: "JOUR" | "SOIR") => string | "LOCK_ERROR";
  addSupplementToLine: (cartItemId: string, supplement: { id: string, name: string, price: number }) => void;
  removeSupplementFromLine: (cartItemId: string, supplementId: string) => void;
  updateLineAccompaniment: (cartItemId: string, accompanimentName: string) => void;
  removeFromCart: (cartItemId: string) => void;
  getItemQuantity: (productId: string) => number; // Ajouté ici pour corriger l'erreur
  isInCart: (productId: string) => boolean;
  clearCart: () => void;
  updateLineStatus: (cartItemId: string, status: CartItem["status"]) => void;
  getCartTotal: () => number;
  getCartSavings: () => number; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("signature_order_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erreur de parsing du localStorage", e);
        return [];
      }
    }
    return [];
  });

  const [activeMenuType, setActiveMenuType] = useState<"JOUR" | "SOIR" | null>(() => {
    return localStorage.getItem("signature_active_menu_type") as "JOUR" | "SOIR" | null;
  });

  // --- PERSISTANCE AUTOMATIQUE ---
  useEffect(() => {
    localStorage.setItem("signature_order_session", JSON.stringify(cart));
    if (cart.length > 0 && activeMenuType) {
      localStorage.setItem("signature_active_menu_type", activeMenuType);
    } else if (cart.length === 0) {
      localStorage.removeItem("signature_active_menu_type");
    }
  }, [cart, activeMenuType]);

  // --- ACTIONS ---

  // On utilise productId ici pour filtrer le panier et compter les quantités
  const getItemQuantity = (productId: string) => {
    return cart
      .filter(item => item.id === productId)
      .reduce((acc, item) => acc + (item.quantity || 1), 0);
  };

  const addToCart = (
    item: Omit<CartItem, "cartItemId" | "status" | "quantity">, 
    menuType: "JOUR" | "SOIR"
  ) => {
    if (activeMenuType && activeMenuType !== menuType && cart.length > 0) {
      return "LOCK_ERROR";
    }

    if (cart.length === 0) {
      setActiveMenuType(menuType);
    }

    setCart((prev) => {
      const existingLineIndex = prev.findIndex((line) => {
        const sameId = line.id === item.id;
        const sameAcc = line.chosenAccompaniment === item.chosenAccompaniment;
        const sameSupps = JSON.stringify(line.supplements.map(s => s.id).sort()) === 
                          JSON.stringify((item.supplements || []).map(s => s.id).sort());
        return sameId && sameAcc && sameSupps;
      });

      if (existingLineIndex !== -1) {
        const newCart = [...prev];
        newCart[existingLineIndex] = {
          ...newCart[existingLineIndex],
          quantity: (newCart[existingLineIndex].quantity || 1) + 1
        };
        return newCart;
      }

      const newItem: CartItem = {
        ...item,
        cartItemId: crypto.randomUUID(),
        quantity: 1,
        price: Number(item.price),
        supplements: item.supplements || [],
        status: "pending",
        type: menuType
      };
      return [...prev, newItem];
    });

    return "SUCCESS"; 
  };

  const updateLineAccompaniment = (cartItemId: string, accompanimentName: string) => {
    setCart((prev) => prev.map((item) => 
      item.cartItemId === cartItemId ? { ...item, chosenAccompaniment: accompanimentName } : item
    ));
  };

  const addSupplementToLine = (cartItemId: string, supplement: { id: string, name: string, price: number }) => {
    setCart((prev) => prev.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          supplements: [
            ...item.supplements,
            { id: supplement.id, name: supplement.name, price: supplement.price, status: "pending" }
          ]
        };
      }
      return item;
    }));
  };

  const removeSupplementFromLine = (cartItemId: string, supplementId: string) => {
    setCart((prev) => prev.map((item) => {
      if (item.cartItemId === cartItemId && item.supplements.length > 0) {
        const supps = [...item.supplements];
        let targetIndex = -1;
        for (let i = supps.length - 1; i >= 0; i--) {
          if (supps[i].id === supplementId) {
            targetIndex = i;
            break;
          }
        }
        if (targetIndex !== -1) {
          supps.splice(targetIndex, 1);
          return { ...item, supplements: supps };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
  setCart((prev) => {
    // 1. On cherche la ligne concernée
    const existingLine = prev.find(item => item.cartItemId === cartItemId);
    
    if (!existingLine) return prev;

    let newCart;
    
    // 2. Si la quantité est supérieure à 1, on décrémente
    if (existingLine.quantity > 1) {
      newCart = prev.map(item => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      );
    } else {
      // 3. Si la quantité est de 1, on supprime la ligne complètement
      newCart = prev.filter(item => item.cartItemId !== cartItemId);
    }

    // Gestion du type de menu actif si le panier devient vide
    if (newCart.length === 0) setActiveMenuType(null);
    
    return newCart;
  });
};

  const isInCart = (productId: string) => cart.some((item) => item.id === productId);

  const clearCart = () => {
    setCart([]);
    setActiveMenuType(null);
    localStorage.removeItem("signature_order_session");
    localStorage.removeItem("signature_active_menu_type");
  };

  const updateLineStatus = (cartItemId: string, status: CartItem["status"]) => {
    setCart(prev => prev.map(i => i.cartItemId === cartItemId ? {...i, status} : i));
  };

  const calculateTotals = () => {
    let totalSansPromo = 0;
    let totalAvecPromo = 0;

    const productStats: Record<string, { quantity: number; firstItem: CartItem; allSupplementsTotal: number }> = {};

    cart.forEach(item => {
      if (!productStats[item.id]) {
        productStats[item.id] = { quantity: 0, firstItem: item, allSupplementsTotal: 0 };
      }
      const qty = item.quantity || 1;
      productStats[item.id].quantity += qty;
      const lineSuppsTotal = (item.supplements || []).reduce((acc, s) => acc + (Number(s.price) || 0), 0);
      productStats[item.id].allSupplementsTotal += (lineSuppsTotal * qty);
    });

Object.values(productStats).forEach(({ quantity, firstItem, allSupplementsTotal }) => {
  // On extrait la valeur brute
  const rawPrice = firstItem.price;

  const unitPrice = typeof rawPrice === 'string' 
    ? parseFloat((rawPrice as string).replace(',', '.')) // On force l'interprétation en string ici
    : Number(rawPrice || 0);

  totalSansPromo += (quantity * unitPrice) + allSupplementsTotal;

      if (firstItem.offer?.enabled && quantity >= firstItem.offer.requiredQuantity) {
        const nbLots = Math.floor(quantity / firstItem.offer.requiredQuantity);
        const reste = quantity % firstItem.offer.requiredQuantity;
        totalAvecPromo += (nbLots * firstItem.offer.offerPrice) + (reste * unitPrice) + allSupplementsTotal;
      } else {
        totalAvecPromo += (quantity * unitPrice) + allSupplementsTotal;
      }
    });

    return { finalTotal: totalAvecPromo, savings: totalSansPromo - totalAvecPromo };
  };

  const getCartTotal = () => calculateTotals().finalTotal;
  const getCartSavings = () => calculateTotals().savings;

  return (
    <CartContext.Provider value={{ 
      cart, 
      activeMenuType,
      addToCart, 
      addSupplementToLine, 
      removeSupplementFromLine,
      updateLineAccompaniment, 
      removeFromCart, 
      getItemQuantity, // Ajouté dans la value
      isInCart, 
      clearCart, 
      updateLineStatus, 
      getCartTotal,
      getCartSavings
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};