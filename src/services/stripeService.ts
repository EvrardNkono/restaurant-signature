// services/stripeService.ts
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLIC_KEY = "pk_test_51SmwlcLQhJAitc3fh2djFWNSaw07tRmTl4xuc53iatQ8rWvhMLpXIWVkxRtLB43OlsuEr2HOfyFSPcZFf6Am59kL00x2YXTlCf";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const handleCheckout = async (orderData: {
  orderId: string;
  items: any[];
  deliveryFee: number;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderMode: string;
  metadata?: Record<string, string>;
}) => {
  const stripe = await stripePromise;
  if (!stripe) throw new Error("Stripe non chargé");

  // Utilisez votre endpoint existant
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://signature-backend-alpha.vercel.app/api";

  // Format des items pour votre backend
  const formattedItems = orderData.items.map(item => ({
    name: item.name,
    price: item.price, // déjà en euros
    quantity: item.quantity,
    chosenAccompaniment: item.description || "Aucun"
  }));

  // Appel à votre endpoint existant
  const response = await fetch(`${API_URL}/payments/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: formattedItems,
      orderId: orderData.orderId
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la création de la session");
  }

  const data = await response.json();

  // Redirection vers Stripe
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error("Impossible de créer la session de paiement");
  }
};

export const formatCartItemsForStripe = (cart: any[]) => {
  return cart.map((item: any) => {
    const unitPrice = parseFloat(String(item.price || "0").replace(/[^\d.]/g, "")) || 0;
    const supplementsTotal = item.supplements?.reduce((sum: number, supp: any) => {
      return sum + (parseFloat(String(supp.price || "0").replace(/[^\d.]/g, "")) || 0);
    }, 0) || 0;
    
    const totalItemPrice = (unitPrice + supplementsTotal) * (item.quantity || 1);
    
    return {
      name: item.name,
      quantity: item.quantity || 1,
      price: totalItemPrice,
      description: item.chosenAccompaniment && item.chosenAccompaniment !== "Aucun" 
        ? `Accompagnement: ${item.chosenAccompaniment}` 
        : undefined,
    };
  });
};