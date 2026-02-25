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
  category?: string; // Utile pour identifier les boissons
  image?: string;
  chosenAccompaniment?: string;
  supplements: CartSupplement[];
  status: "pending" | "paid" | "delivered"; 
  type: "JOUR" | "SOIR";
  // Structure pour l'offre par lot (ex: 3 pour 5€)
  offer?: {
    enabled: boolean;
    requiredQuantity: number;
    offerPrice: number;
  };
}

interface CartContextType {
  cart: CartItem[];
  activeMenuType: "JOUR" | "SOIR" | null;
  addToCart: (item: Omit<CartItem, "cartItemId" | "status">, menuType: "JOUR" | "SOIR") => string | "LOCK_ERROR";
  addSupplementToLine: (cartItemId: string, supplement: { id: string, name: string, price: number }) => void;
  removeSupplementFromLine: (cartItemId: string, supplementId: string) => void;
  updateLineAccompaniment: (cartItemId: string, accompanimentName: string) => void;
  removeFromCart: (cartItemId: string) => void;
  isInCart: (productId: string) => boolean;
  clearCart: () => void;
  updateLineStatus: (cartItemId: string, status: CartItem["status"]) => void;
  getCartTotal: () => number;
  getCartSavings: () => number; // Permet d'afficher l'économie totale au client
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // --- INITIALISATION PARESSEUSE ---
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

  const addToCart = (
    item: Omit<CartItem, "cartItemId" | "status">, 
    menuType: "JOUR" | "SOIR"
  ) => {
    if (activeMenuType && activeMenuType !== menuType && cart.length > 0) {
      return "LOCK_ERROR";
    }

    if (cart.length === 0) {
      setActiveMenuType(menuType);
    }

    const newCartItemId = crypto.randomUUID();
    const newItem: CartItem = {
      ...item,
      cartItemId: newCartItemId,
      price: Number(item.price),
      supplements: item.supplements || [],
      status: "pending",
      type: menuType
    };

    setCart((prev) => [...prev, newItem]);
    return newCartItemId; 
  };

  const updateLineAccompaniment = (cartItemId: string, accompanimentName: string) => {
    setCart((prev) => prev.map((item) => 
      item.cartItemId === cartItemId 
        ? { ...item, chosenAccompaniment: accompanimentName } 
        : item
    ));
  };

  const addSupplementToLine = (cartItemId: string, supplement: { id: string, name: string, price: number }) => {
    setCart((prev) => prev.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          supplements: [
            ...item.supplements,
            { 
              id: supplement.id, 
              name: supplement.name, 
              price: supplement.price,
              status: "pending" 
            }
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
      const newCart = prev.filter((i) => i.cartItemId !== cartItemId);
      if (newCart.length === 0) {
        setActiveMenuType(null);
      }
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

  // --- LOGIQUE DE CALCUL DU PANIER (PROMOS ET TOTAL) ---

  const calculateTotals = () => {
    let totalSansPromo = 0;
    let totalAvecPromo = 0;

    // On regroupe par ID de produit pour pouvoir appliquer les règles de lot
    // même si les articles sont sur des lignes différentes (ex: 3 boissons)
    const groupedItems: Record<string, CartItem[]> = {};
    cart.forEach(item => {
      if (!groupedItems[item.id]) {
        groupedItems[item.id] = [];
      }
      groupedItems[item.id].push(item);
    });

    Object.values(groupedItems).forEach(items => {
      const first = items[0];
      const quantity = items.length;
      const unitPrice = Number(first.price) || 0;
      
      // Total des suppléments pour ce groupe d'items
      const supplementsTotal = items.reduce((sum, item) => 
        sum + item.supplements.reduce((sSum, s) => sSum + s.price, 0), 0
      );

      totalSansPromo += (quantity * unitPrice) + supplementsTotal;

      // Si une offre est active et que la quantité est suffisante
      if (first.offer?.enabled && quantity >= first.offer.requiredQuantity) {
        const nbLots = Math.floor(quantity / first.offer.requiredQuantity);
        const reste = quantity % first.offer.requiredQuantity;

        const prixLots = nbLots * first.offer.offerPrice;
        const prixReste = reste * unitPrice;

        totalAvecPromo += prixLots + prixReste + supplementsTotal;
      } else {
        totalAvecPromo += (quantity * unitPrice) + supplementsTotal;
      }
    });

    return { 
      finalTotal: totalAvecPromo, 
      savings: totalSansPromo - totalAvecPromo 
    };
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