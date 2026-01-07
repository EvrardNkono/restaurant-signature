import { loadStripe } from "@stripe/stripe-js";

// Remplace par ta clé publique Stripe (pk_test_...)
const stripePromise = loadStripe("pk_test_VOTRE_CLE_PUBLIQUE");

export const handleCheckout = async (cartItems: any[]) => {
  const stripe = await stripePromise;

  if (!stripe) throw new Error("Stripe non chargé");

  // 1. Appel de ton API Vercel
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItems }),
  });

  const session = await response.json();

  if (session.id) {
    // Le "as any" ici force TypeScript à ignorer le bug de définition de type
    // car on sait que redirectToCheckout existe réellement dans le navigateur.
    await (stripe as any).redirectToCheckout({
      sessionId: session.id,
    });
  }
};